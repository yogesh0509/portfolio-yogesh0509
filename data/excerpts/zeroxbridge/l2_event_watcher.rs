/// This function queries the L2 burn contract for events,
/// filters them by the "BurnEvent" event selector, and parses them into CommitmentLog structs.
pub async fn fetch_l2_burn_events<P: TestProvider>(
    config: &AppConfig,
    db_pool: &PgPool,
    from_block: u64,
    provider: &P,
) -> Result<Vec<CommitmentLog>> {
    // Get a connection from the pool
    let mut conn = db_pool.acquire().await?;
    
    // Load last processed block if available
    let start_block = match get_last_processed_block(&mut conn, BLOCK_TRACKER_KEY).await {
        Ok(Some(last_block)) => last_block + 1,
        Ok(None) => from_block,
        Err(e) => {
            warn!("Failed to get last processed block: {}", e);
            from_block
        }
    };
    
    // Get current block for pagination purposes
    let latest_block = get_latest_block_with_retry(provider).await?;
    
    // Define the L2 burn contract address
    let burn_contract_address = Felt::from_hex(&config.contracts.l2_contract_address)
        .context("Invalid L2 burn contract address")?;
    
    // Create event selector for the "BurnEvent" event
    let burned_event_key = Felt::from_hex(BURN_EVENT_KEY)
        .context("Failed to create event key")?;
    
    // Define the event filter
    let event_filter = EventFilter {
        from_block: Some(BlockId::Number(start_block)),
        to_block: Some(BlockId::Number(latest_block)),
        address: Some(burn_contract_address),
        keys: Some(vec![vec![burned_event_key]]),
    };
    
    let mut all_events = Vec::new();
    let mut continuation_token = None;
    
    // Fetch events with pagination
    loop {
        let events = fetch_events_with_retry(
            provider, 
            &event_filter, 
            continuation_token.clone(), 
            DEFAULT_PAGE_SIZE
        ).await?;
        
        if events.events.is_empty() {
            print!("No events found!!");
            break;
        }
        
        // Parse events into CommitmentLog structs
        for event in &events.events {
            if event.data.len() >= 4 {
                // BurnEvent data structure:
                // [user, amount_low, amount_high, commitment_hash]
                let user = event.data[0].to_hex_string();
                let amount_low = event.data[1].to_hex_string();
                let amount_high = event.data[2].to_hex_string();
                let commitment_hash = event.data[3].to_hex_string();
                
                all_events.push(CommitmentLog {
                    commitment_hash,
                    block_number: event.block_number.expect("Event must have a block number"),
                    transaction_hash: event.transaction_hash.to_hex_string(),
                    user,
                    amount_low,
                    amount_high,
                });
            } else {
                warn!(
                    "Invalid event data length: expected 4, got {}",
                    event.data.len()
                );
            }
        }
        
        // Update continuation token for next page
        continuation_token = events.continuation_token;
        
        // If no continuation token, we've fetched all events
        if continuation_token.is_none() {
            break;
        }
    }
    
    // Store the latest block number we've processed
    if !all_events.is_empty() {
        let max_block = all_events.iter().map(|e| e.block_number).max().unwrap_or(start_block);
        if let Err(e) = update_last_processed_block(&mut conn, BLOCK_TRACKER_KEY, max_block).await {
            warn!("Failed to update last processed block: {}", e);
        }
    } else if latest_block > start_block {
        // Even if no events found, update the last processed block to avoid rescanning
        if let Err(e) = update_last_processed_block(&mut conn, BLOCK_TRACKER_KEY, latest_block).await {
            warn!("Failed to update last processed block: {}", e);
        }
    }
    
    info!(
        "Fetched {} L2 burn events from blocks {} to {}",
        all_events.len(),
        start_block,
        latest_block
    );
    
    Ok(all_events)
}

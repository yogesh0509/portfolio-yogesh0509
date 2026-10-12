    function checkUpkeep(
        bytes memory /* checkData */
    )
        external
        view
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        if (s_currentplayercount <= s_totalplayerCount && !s_unlock) {
            upkeepNeeded = (block.timestamp - s_currentAuctionTime >=
                s_auctionTime);
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(bytes calldata /*performData*/) external {
        if (s_currentplayercount < s_totalplayerCount) {
            if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                !s_auctionState
            ) {
                s_auctionState = true;
                s_currentAuctionTime = block.timestamp;
                s_AuctionContract.restartAuction(s_currentplayercount);
            } else if (
                (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
                s_auctionState
            ) {
                s_auctionState = false;
                s_currentAuctionTime = block.timestamp;
                (
                    address s_highestBidder,
                    uint256 s_highestBid
                ) = s_AuctionContract.auctionEnd(s_currentplayercount);

                s_biddingPrice = 1;

                s_BuyerTransactions[s_highestBidder][
                    s_BuyerTransactionCount[s_highestBidder]
                ] = playerBought(
                    s_PICContract.getplayerDetails(s_currentplayercount),
                    s_currentplayercount,
                    s_highestBid
                );

                s_BuyerTransactionCount[s_highestBidder]++;
                s_currentplayercount++;
            }
        } else if (
            s_currentplayercount == s_totalplayerCount &&
            (block.timestamp - s_currentAuctionTime >= s_auctionTime) &&
            !s_unlock
        ) {
            string[] memory args = new string[](2);
            args[0] = addressToString(address(s_PICContract));
            args[1] = Strings.toString(s_totalplayerCount);

            s_currentAuctionTime = block.timestamp;

            FunctionsRequest.Request memory req;
            req.initializeRequestForInlineJavaScript(s_source); // Initialize the request with JS code
            req.setArgs(args);

            // Send the request and store the request ID
            s_lastRequestId = _sendRequest(
                req.encodeCBOR(),
                s_subscriptionId,
                s_gasLimit,
                donId
            );
            // Chainlink.Request memory request = buildOperatorRequest(
            //     stringToBytes32(jobId),
            //     this.fulfill.selector
            // );
            // request.add("PIC", addressToString(address(s_PICContract)));
            // sendOperatorRequestTo(oracle, request, fee);
        }
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        emit RequestFulfilled(requestId);

        calculateTeamScore(abi.decode(response, (uint256[])));
        s_winner = calculateWinner();
        s_unlock = true;
        s_winnerFunds[s_winner] = (7 * address(this).balance) / 10;
        s_TreasuryFunds = (3 * address(this).balance) / 10;
    }

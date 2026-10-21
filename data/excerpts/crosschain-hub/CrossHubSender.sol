contract CrossHubSender is Withdraw {
    enum PayFeesIn {
        Native,
        LINK
    }

    address immutable i_router;
    address immutable i_link;

    event MessageSent(bytes32 messageId); // Event emitted when a message is sent to another chain.

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance.

    constructor(address router, address link) {
        i_router = router;
        i_link = link;
    }

    receive() external payable {}

    /// @notice Sends payload to receiver on the destination chain.
    /// @notice Pay for fees in native gas or LINK.
    /// @dev Assumes your contract has sufficient native gas tokens or LINK.
    /// @param destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param receiver The address of the recipient on the destination blockchain.
    /// @param functionPayload Payload which is encoded logic contract function data.
    /// @param payFeesIn enum to pay in either native gas tokens or LINK
    /// @return messageId The ID of the CCIP message that was sent.
    function crossChainCall(
        uint64 destinationChainSelector,
        address receiver,
        bytes memory functionPayload,
        PayFeesIn payFeesIn
    ) external returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: functionPayload,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: payFeesIn == PayFeesIn.LINK ? i_link : address(0)
        });

        uint256 fee = IRouterClient(i_router).getFee(
            destinationChainSelector,
            message
        );

        if (payFeesIn == PayFeesIn.LINK) {
            if (fee > LinkTokenInterface(i_link).balanceOf(address(this)))
                revert NotEnoughBalance(
                    LinkTokenInterface(i_link).balanceOf(address(this)),
                    fee
                );

            LinkTokenInterface(i_link).approve(i_router, fee);
            messageId = IRouterClient(i_router).ccipSend(
                destinationChainSelector,
                message
            );
        } else {
            if (fee > address(this).balance)
                revert NotEnoughBalance(address(this).balance, fee);

            messageId = IRouterClient(i_router).ccipSend{value: fee}(
                destinationChainSelector,
                message
            );
        }

        emit MessageSent(messageId);
    }
}

# Dzap Task 1

In this task, you are required to integrate 1inch swap functionality into your React.js frontend. The goal is to create a user-friendly interface that allows users to perform token swaps via the 1inch API.

## API Endpoints

The project includes several API endpoints that interact with the 1inch API:

1. **`/api/quote`** - This endpoint retrieves an extensive list of available tokens for swapping within a specific network, offering users essential insights into the tokens they can trade.

2. **`/api/gasfees`** - Calculating the expected gas fees for a given transaction is the primary function of this endpoint. It allows users to estimate the cost associated with their token swap.

3. **`/api/quote`** - Responsible for determining the anticipated output amount for a particular pair of tokens in relation to the provided input amount of the token. This endpoint offers users an estimate of the expected output for their swap.

4. **`/api/allowance`** - This endpoint verifies whether the user's wallet has been granted approval to spend the tokens necessary for a transaction, ensuring that the wallet possesses the required authorization to execute the intended trade.

5. **`/api/approve`** - In cases where the wallet lacks the necessary approval to spend the required tokens, this endpoint can be invoked to initiate the approval process, granting the essential permissions for the transaction.

6. **`/api/swap`** - When the user's wallet possesses both the required allowance and a sufficient balance, this endpoint can be called to perform the actual swap of the desired token pair. It executes the token exchange transaction seamlessly.

## Usage

To run this project, follow these steps:

1. Clone the repository to your local machine.

2. Install the required dependencies using `npm install`.

3. Set up your environment variables, including any API keys or configuration needed for the 1inch API.

4. Start the React.js application using `npm start`.

5. Access the application in your web browser.

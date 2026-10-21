# Google Summer of Code 2023 Proposal

# Personal Details
**Name:** Yogesh Agrawal

**Email:** agrawalyogesh5047@gmail.com

**College Name:** BMS College of Engineering

**Degree:** BE 

**Expected Graduation Year:** 2025

**LinkedIn:** [LinkedIn](https://www.linkedin.com/in/yogesh0509/) 

**GitHub:** [Github](https://github.com/yogesh0509) 

**Resume -** [Resume](https://drive.google.com/file/d/1zlReu8g6K6erq7awJKPfKokFHPeEsat9/view?usp=sharing)

**Primary Spoken Language:** English

# Chosen Idea: Agora Blockchain
## Abstract
The basic features in an Election DApp are user registration, election creation, voting and result calculation. To make our DApp more secure and trustworthy, we need to add verification for users so that a single user cannot impersonate someone else which can affect the voting results.

# I. Technical Details

## 1. Authentication using polygonID

A major problem with online voting is that a single person can have multiple accounts and thus can vote for the same election using his different accounts thus making the election unfair and unjust. This is why it is important that each individual that votes in the election must have provided a proof for his identity.

**Why polygonID(An improvement over previous proposal)?**

* Polygon ID, with the help of zero-knowledge proofs, lets users prove their identity without the need of exposing their private information. It means that once the voter have obtained the claim by providing necessary documents required for proving his identity, it can later verify itself during his vote without revealing its documents using zk proof.

* The architecture of the framework is composed of three modules: Identity Holder, Issuer, and Verifier. These three, together, form what we call the triangle of trust.

    * Issuer: An entity (person, organization, or thing) that issues Verifiable Credentials (VCs)s to the Holders. Verifiable Credentials (VCs)s are cryptographically signed by the Issuer. Every VCs comes from an Issuer.
    In our case ElectionOrganizer.sol can be the Issuer which will issue VC to each user who send their KYC credentials.

    * Verifier: A Verifier verifies the proof presented by a Holder. It requests the Holder to send a proof based on the VCs they hold in their wallet. While verifying a proof, the Verifier performs a set of checks, for example that the VC was signed by the expected Issuer and that the VC matches the criteria requested by the Verifier. In our case it would check whether the id of the user KYC credentials, eg: "aadhar card", is present in the holder wallet.

    ![](https://0xpolygonid.github.io/tutorials/imgs/triangle-of-trust-simple.png)

* [More about polyognID and its architecture](https://wiki.polygon.technology/docs/polygonid/overview/)
* [More about zero-knowledge proofs](https://ethereum.org/en/zero-knowledge-proofs/)

#### 2.1 Steps for complete Verification
1. Upload the image of the document that user is submitting along with the document ID.
2. A distributed network of accounts that will verify the ID.
3. The issuer sends a request which would generate a claim that says that the user is verified. This claim needs to be claimed by the users in its [polygonID wallet app](https://play.google.com/store/apps/details?id=com.polygonid.wallet&hl=en_IN&gl=US&pli=1)
4. Now the user can vote in the election as it has been verified.

#### 2.2 Detailed walkthrough of each step

1. Add this function in the voter.sol contract
        ```solidity
        struct VoterCredentials {
            string memory docImage, 
            string memory docId
        };

        mapping(addres=>VoterCredentials) public voterCredentials;

        function verifyVoter(string memory _docImage, string memory _docId) public {
            voterCredentials[msg.sender].docImage = _docImage;
            voterCredentials[msg.sender].docId = _docId;
        }
        ```
2. 
   * We can create a new contract called as ElectionSupervisor.sol. 
   * Its task is to verify each voter and send a response back as **verified**, **pending** or **rejected**
   * There will be multiple election supervisors. 
   * After their verification they will send their response for each voter and the final response for each voter will itself be generated using ```ResultCalculator.sol```.
   * Each election supervisor will be given incentive so that they do not verify fraud candidates.
   * Let us understand this through an example:

      Suppose ElectionSupervisor1 has voted that the voter has been verified but at the end of the vote it has been declared that the voter has been rejected, the ElectionSupervisor1 will have to pay a penalty while if the end result of the vote is the same as that of ElectionSupervisor1 he will be rewarded.

   * [Here is a quick article how users can earn chainlink tokens by running a node which is a similar approach to what we have discussed above](https://read.cash/@Meta_comic/7-ways-to-earn-chainlink-link-2021-f576281f)

3. 
   * We are now ready to issue claims to the users who have already verified with us.
   * Before issuing claims, we need to create a schema that the claim will follow.
   * [Docs for creating a shcema](https://0xpolygonid.github.io/tutorials/issuer/schema/)
   * [Docs for creating a claim](https://0xpolygonid.github.io/tutorials/issuer-node/issuer-node-api/claim/apis/#create-claim)
   * After the claim has been created, a QR code will be generated that the users can scan from their polygonID wallet to recieve the claim in their polygonID wallet. 
   * Now the user holds the claim that he/she is a valid person and can vote in the election.
   * [Further docs required for being an issuer can be found here.](https://0xpolygonid.github.io/tutorials/issuer/issuer-overview/)

    ![](https://0xpolygonid.github.io/tutorials/imgs/triangle-of-trust-simple.png)

4. 
    * The last step is to generate a QR code that users can scan from their polygonID wallet.
    * Demo json file for QR code.
        ```
        {
            "id": "7f38a193-0918-4a48-9fac-36adfdb8b542",
            "typ": "application/iden3comm-plain-json",
            "type": "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
            "thid": "7f38a193-0918-4a48-9fac-36adfdb8b542",
            "body": {
                "reason": "airdrop participation",
                "transaction_data": {
                    "contract_address": "<ERC20VerifierAddress>",
                    "method_id": "b68967e2",
                    "chain_id": 80001,
                    "network": "polygon-mumbai"
                },
                "scope": [
                    {
                        "id": 1,
                        "circuitId": "credentialAtomicQuerySigV2OnChain",
                        "query": {
                            "allowedIssuers": [
                                "*"
                            ],
                            "context": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
                            "credentialSubject": {
                                "birthday": {
                                    "$lt": 20020101
                                }
                            },
                            "type": "KYCAgeCredential"
                        }
                    }
                ]
            }
        }
        ```
    * This json file will link to the vote function in ```vote.sol```.
    * [Further docs](https://0xpolygonid.github.io/tutorials/verifier/on-chain-verification/overview/)

        ![](https://0xpolygonid.github.io/tutorials/imgs/on-chain-verification-flow.png)


## 2. Extra features

* Deploy on layer 2 networks - The smart contracts can be deployed on layer 2 networks like Arbitrum, polygon which offer lower gas fees and are faster than ethereum.

* UI/UX improvements - The overall UI of the website can be improved so that it is easy for users to navigate the website and explore all the features that we offer.


### 0. Before Community Bonding

* Get familiar with the Agora Blockchain codebase.
* Be ready with a plan and ideas to discuss

### 1. Community Bonding Period
#### 1.1 Week 1:
* Get in touch with my project mentor, introduce myself in the community, and work out a good time to communicate (taking into account timezone differences and their schedule).
* Ask the mentor for his ideas/plans for the project. The project proposal reflects my knowledge of writing, there may be essential amendments required and it would be better to make them early.
#### 1.2 Week 2:
* Go through the Agora Blockchain codebase thoroughly. Make notes of the functions/files that might be helpful in future.
* Explore the existing solutions and keep a track of the best approaches found.
* Get in contact with other GSoCer's , both within the AOSSIE community and outside.
#### 1.3 Week 3:
* Discuss the current approach with the mentor and start noting down their advantages and disadvantages of them.
* Come up with the possible approaches and finalize what all features are required.
* Start laying out a general outline of the possible cases.

### 2. Phase 1
#### 2.1 Week 4:
* Study the polygonID docs thoroughly.
* Make changes in the BrightID.sol contract.
* Check the requirements for running a local issuer node.
* Set up docker for running a issuer node.
* Get familiar with GO language for easy implementaion.
* Finally, run an issuer node.
#### 2.2 Week 5:
* Discuss the necessary fields required for creating a schema.
* Connect your smart contract with the isser node so that schema can be generated.
* Work with the necessary api to create a schema.
* Finally, generate your schema.
#### 2.3 Week 6:
* Write contracts for saving metadata of voter documents.
* Create a web3.storage account.
* Upload the voter documents to ipfs.
#### 2.4 Week 7:
* Write ElectionSupervisor contract.
* Allow people to become election supervisors.
* Election Supervisor can start voting for voter credentials.
* Reward the election supervisor accordingly.
#### 2.5 Week 8:    
* Issue claims to voters who have been verified.
* Update the UI with the QR codes of the claims that voters can scan with their polygonID app.
#### 2.6 Week 9:
* Set up QR codes in the front-end which users can scan to directly vote in their election.
* Link those QR codes with ```vote()``` function using ZKPVerifier.
* Deploy contracts related to polygonID.

### 3. Phase 2
#### 3.1 Week 10:
* Add other chains to the frontend.
* Integrate frontend with the smart contracts.
#### 3.2 Week 11:
* Testing and compiling phase.
* Handle any unexpected errors.
* Deploying on the test net.
* Complete any left-over work.
#### 3.3 Week 12:
* Improving css and other design changes.
* Improving the UX of the website.
#### 3.4 Week 13:
* Testing each function and asserting it to check errors.
* Checking the application with different test cases.
* Finalize and complete the documentation.
* Refactor Code.
#### 3.5 Week 14:    
* Deploying on layer 2 network.
* Checking the entire application thoroughly
* Work on leftover stuff.
#### 3.6 Week 15:
* Buffer week for unexpected delays, final submissions for GSoC 2022.

# III. Skills
### Programming Skills
>* Solidity
>* Fluent in JS, Reactjs
>* Good knowledge of C++, Python
### Blockchain Skills
>* Good knowledge of Blockchain basics including Solidity, Metamask, Web3, hardhat.
>* Have worked projects that rely heavily on chainlink, polygon.
>* Solved CTF like ethernaut.
>* Comfortable with Git and GitHub.
# IV. Previous Blockchain Project Development Experience
* web3-Dream11 - [https://github.com/yogesh0509/web3-DREAM11](https://github.com/yogesh0509/web3-DREAM11)

It is a platform where cricket teams and franchises can buy players. Cricket teams and franchises can browse the available players(which are NFT'S) and place bids on the ones they are interested in acquiring. The auction process usually takes place in a live auction event, where team owners and representatives bid against each other in real-time for the players they want. A live player rating is given at the end of the tournament to each player. Ratings of all players in a team are added and the team with the most point is declared winner of the tournament.

**Implementation website**: [Link](https://web3-dream-11.vercel.app/)

* SocioDao - [https://github.com/yogesh0509/SocioDAO](https://github.com/yogesh0509/SocioDAO)

To become a member of the society, interested individuals need to verify their identity by entering their Aadhar number. This step ensures that only genuine members are granted access to the society's platform and that the voting process is fair and transparent. Once verified, members can purchase properties that are listed on the platform.

**Devfolio Hackathon link**: [https://devfolio.co/projects/sociodao-8d7e](https://devfolio.co/projects/sociodao-8d7e)


<br>

# V. Other Open-Source development experience
* **HSOC22** - It is a community polling app

    **Merged PR**:
[https://github.com/agamjotsingh18/pollitup/pull/66](https://github.com/agamjotsingh18/pollitup/pull/66)

# VI. Why this Project?
The project can be very useful in making the elections transparent while allowing the user to chose from their desired voting method. I have worked on a similar project **SocioDao**, thus it would be easy for me to adapt to the project codebase.
* **Different algorithms:** It allows user to chose between various election methods giving them flexibility.
* **Flexibility and User experience:** Since there can be multiple elections, the app has a lot of flexibility.
* **A chance to be a part of an open-source community:** I want to take up this opportunity to work in a large scale open-source organisation.
# VII. Do you have any commitments during the GSoC Period?
I have no commitments for this summer and will be available to contribute to the project.
<br> <br>

# VIII. How many hours will you work per week?
I'll work for 15+ hours per week.
# IX. About Me
I'm a MERN stack and blockchain developer currently studying in my second year at BMS College of Engineering, Bangalore. As a MERN stack developer, I'm proficient in using MongoDB, Express.js, React, and Node.js to build web applications that are efficient, scalable, and user-friendly. In addition to my work as a MERN stack developer, I'm also interested in blockchain technology. I've been studying blockchain for some time and have experience working with Ethereum and Solidity to develop smart contracts and decentralized applications. I enjoy contributing to open source projects whenever I can and I'm always on the lookout for new opportunities to get involved.
<br>

# XI. Why Me?
I have a deep understanding of Solidity along with React.js thus I can work on both frontend and backend simultaneously. I have also worked on similar projects before and have good grasp on the existing codebase. I also have experience with ctf challenges which have helped me avoid hacks and save me a lot of gas during transactions

I'm fairly confident to work on the project and make it a success.


---

### Thank You
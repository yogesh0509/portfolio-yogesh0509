import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { encodeMyMethodCall } from './middleware/payloadEncoder'
import { contractAddr, abi } from "./constants/CCIP"

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/cross_chain/:currentChainId/:logic_contractChainId", (req: Request, res: Response, next: NextFunction) => {

  const currentChainId: string = req.params.currentChainId
  const logic_contractChainId: string = req.params.logic_contractChainId
  const { JSONInterface, args, address } = req.body

  // args -> decide if we want to pass an array directly!!
  try {
    const payload: string = encodeMyMethodCall(JSONInterface, args, address)

    res.status(200).json({
      senderContractAddress: contractAddr[currentChainId].senderContractAddress,
      senderABI: abi,
      logicContractChainSelector: contractAddr[logic_contractChainId].logicContractChainSelector,
      receiverContractAddress: contractAddr[logic_contractChainId].receiverContractAddress,
      payload: payload
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    })
  }
})

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("HELLO")
  const error: Error = new Error("Not found");
  (error as any).status = 404;
  next(error);
});

app.use((error: any, req: Request, res: Response) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

app.listen(port, () => {
  console.log("The application started successfully");
});

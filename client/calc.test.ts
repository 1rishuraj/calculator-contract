import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {test, expect} from "bun:test"
import { LiteSVM } from "litesvm"
test("calculating",()=>{
  let svm=new LiteSVM();
  let contractKp=Keypair.generate();
  svm.addProgramFromFile(contractKp.publicKey,'folder/calculator.so');
  //user wallet + airdrop
  let userKP=Keypair.generate();
  let data_accKP=Keypair.generate();
  svm.airdrop(userKP.publicKey,BigInt(LAMPORTS_PER_SOL));
  //create data acc
  let ix=SystemProgram.createAccount({
    fromPubkey: userKP.publicKey,
    newAccountPubkey: data_accKP.publicKey,
    lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
    space: 4,
    programId: contractKp.publicKey
  })
  const tx=new Transaction();
  tx.add(ix);
  tx.feePayer=userKP.publicKey;
  tx.recentBlockhash=svm.latestBlockhash();
  tx.sign(userKP,data_accKP);
  svm.sendTransaction(tx);
  //send init txn
  let ix2=new TransactionInstruction({
      keys: [
        {pubkey: data_accKP.publicKey,
        isSigner: true,
        isWritable: true}
      ],

      programId: contractKp.publicKey,
      
      data: Buffer.from([0]) //0th index is init in Rust enum
  })
  const tx2=new Transaction();
  tx2.add(ix2);
  tx2.feePayer=userKP.publicKey;
  tx2.recentBlockhash=svm.latestBlockhash();
  tx2.sign(userKP,data_accKP);
  svm.sendTransaction(tx2);
  //test value as 1
  let innerdata=svm.getAccount(data_accKP.publicKey);
  expect(innerdata?.data[0]).toBe(1);
  expect(innerdata?.data[1]).toBe(0);
  expect(innerdata?.data[2]).toBe(0); 
  expect(innerdata?.data[3]).toBe(0);

  //send Double txn
  let ix3=new TransactionInstruction({
      keys: [
        {pubkey: data_accKP.publicKey,
        isSigner: true,
        isWritable: true}
      ],

      programId: contractKp.publicKey,

      data: Buffer.from([1]) //1th index is double in Rust enum
  })
  const tx3=new Transaction();
  tx3.add(ix3);
  tx3.feePayer=userKP.publicKey;
  tx3.recentBlockhash=svm.latestBlockhash();
  tx3.sign(userKP,data_accKP);
  svm.sendTransaction(tx3);
  //test value as 2
  innerdata=svm.getAccount(data_accKP.publicKey);
  console.log(innerdata?.data)
  expect(innerdata?.data[0]).toBe(2);
  expect(innerdata?.data[1]).toBe(0);
  expect(innerdata?.data[2]).toBe(0); 
  expect(innerdata?.data[3]).toBe(0);

  //send Half txn
  let ix4=new TransactionInstruction({
      keys: [
        {pubkey: data_accKP.publicKey,
        isSigner: true,
        isWritable: true}
      ],

      programId: contractKp.publicKey,

      data: Buffer.from([2]) //2nd index is half in Rust enum
  })
  const tx4=new Transaction();
  tx4.add(ix4);
  tx4.feePayer=userKP.publicKey;
  tx4.recentBlockhash=svm.latestBlockhash();
  tx4.sign(userKP,data_accKP);
  svm.sendTransaction(tx4);
  //test value as 1
  innerdata=svm.getAccount(data_accKP.publicKey);
  console.log(innerdata?.data)
  expect(innerdata?.data[0]).toBe(1);
  expect(innerdata?.data[1]).toBe(0);
  expect(innerdata?.data[2]).toBe(0); 
  expect(innerdata?.data[3]).toBe(0);

  //send Add txn
  let ix5=new TransactionInstruction({
      keys: [
        {pubkey: data_accKP.publicKey,
        isSigner: true,
        isWritable: true}
      ],

      programId: contractKp.publicKey,

      data: Buffer.from(new Uint8Array([3, 4, 0, 0, 0])) //3th index is add in Rust enum, adds 4 to existing value
  })
  const tx5=new Transaction();
  tx5.add(ix5);
  tx5.feePayer=userKP.publicKey;
  tx5.recentBlockhash=svm.latestBlockhash();
  tx5.sign(userKP,data_accKP);
  svm.sendTransaction(tx5);
  //test value as 5
  innerdata=svm.getAccount(data_accKP.publicKey);
  console.log(innerdata?.data)
  expect(innerdata?.data[0]).toBe(5);
  expect(innerdata?.data[1]).toBe(0);
  expect(innerdata?.data[2]).toBe(0); 
  expect(innerdata?.data[3]).toBe(0);

  //send Subtract txn
  let ix6=new TransactionInstruction({
      keys: [
        {pubkey: data_accKP.publicKey,
        isSigner: true,
        isWritable: true}
      ],

      programId: contractKp.publicKey,

      data: Buffer.from(new Uint8Array([4, 5, 0, 0, 0])) //4th index is sub in Rust enum, minus 5 from existing
  })
  const tx6=new Transaction();
  tx6.add(ix6);
  tx6.feePayer=userKP.publicKey;
  tx6.recentBlockhash=svm.latestBlockhash();
  tx6.sign(userKP,data_accKP);
  svm.sendTransaction(tx6);
  //test value as 0
  innerdata=svm.getAccount(data_accKP.publicKey);
  console.log(innerdata?.data)
  expect(innerdata?.data[0]).toBe(0);
  expect(innerdata?.data[1]).toBe(0);
  expect(innerdata?.data[2]).toBe(0); 
  expect(innerdata?.data[3]).toBe(0);
})
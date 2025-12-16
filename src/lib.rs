use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::{AccountInfo, next_account_info}, entrypoint::{ ProgramResult}, program_error::ProgramError, pubkey::Pubkey,entrypoint};

entrypoint!(process_instruction);

#[derive(BorshDeserialize,BorshSerialize)]
struct Counter{
    count:u32
}

#[derive(BorshDeserialize,BorshSerialize)]
enum Ins_type{
    Init,
    Double,
    Half,
    Add{amt:u32},
    Sub{amt:u32}
}
pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{

    //get data account
    let mut it=accounts.iter();
    let data_acc=next_account_info(&mut it)?;
    if !data_acc.is_signer{
        Err(ProgramError::MissingRequiredSignature)?
    }
    //get count [deserialise]
    let mut counter =Counter::try_from_slice(&data_acc.data.borrow())?;
    //get instruction
    let instructn=Ins_type::try_from_slice(instruction_data)?;
    //match instriuction
    match instructn {
        Ins_type::Init=>counter.count=1,
        Ins_type::Double=>counter.count*=2,
        Ins_type::Half=>counter.count/=2,
        Ins_type::Add{amt}=>counter.count+=amt,
        Ins_type::Sub{amt}=>counter.count-=amt,
    }
    //save count[serialise]
    counter.serialize(&mut *data_acc.data.borrow_mut());

    Ok(())
}
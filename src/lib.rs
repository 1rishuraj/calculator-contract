use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

#[derive(BorshDeserialize, BorshSerialize)]
struct Counter {
    count: u32,
}

#[derive(BorshDeserialize, BorshSerialize)]
enum Ins_type {
    Init,
    Double,
    Half,
    Add { amt: u32 },
    Sub { amt: u32 },
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut it = accounts.iter();
    let data_acc = next_account_info(&mut it)?;

    // signer check
    if !data_acc.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // owner check (important!)
    if data_acc.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // deserialize state
    let mut counter = Counter::try_from_slice(&data_acc.data.borrow())?;

    // deserialize instruction
    let instruction = Ins_type::try_from_slice(instruction_data)?;

    // execute with clamping
    match instruction {
        Ins_type::Init => counter.count = 1,

        Ins_type::Double => {
            counter.count = counter.count.saturating_mul(2);//saturating mul returns u32 that must be stored into count
        }

        Ins_type::Half => {
            counter.count = counter.count.saturating_div(2);
        }

        Ins_type::Add { amt } => {
            counter.count = counter.count.saturating_add(amt);
        }

        Ins_type::Sub { amt } => {
            counter.count = counter.count.saturating_sub(amt);
        }
    }

    // serialize back
    counter.serialize(&mut *data_acc.data.borrow_mut())?;

    Ok(())
}

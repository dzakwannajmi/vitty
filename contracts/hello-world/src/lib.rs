#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env};

#[contract]
pub struct DonationContract;

#[contractimpl]
impl DonationContract {
    pub fn donate(env: Env, donor: Address, amount: i128, token_address: Address) {
        // Pastikan pengirim adalah orang yang menandatangani transaksi
        donor.require_auth();

        // Inisialisasi client token (XLM di testnet biasanya punya alamat sendiri)
        let client = token::Client::new(&env, &token_address);

        // Transfer dari donor ke alamat kontrak ini
        client.transfer(&donor, &env.current_contract_address(), &amount);
    }

    // Fungsi tambahan untuk melihat saldo kontrak jika perlu
    pub fn get_balance(env: Env, token_address: Address) -> i128 {
        let client = token::Client::new(&env, &token_address);
        client.balance(&env.current_contract_address())
    }
}

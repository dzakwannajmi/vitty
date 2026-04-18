import { requestAccess, signTransaction } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

export const useContract = () => {
  const server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org"
  );

  const networkPassphrase = StellarSdk.Networks.TESTNET;

  const donationAddress = import.meta.env.VITE_DONATION_ADDRESS;

  // 🔑 Ambil public key dari Freighter
  const getPublicKey = async () => {
    const result = await requestAccess();

    if (!result || !result.address) {
      throw new Error("Gagal akses wallet");
    }

    return result.address;
  };

  // 👤 Ambil info akun
  const getAccountInfo = async () => {
    try {
      const publicKey = await getPublicKey();

      const account = await server.loadAccount(publicKey);

      const nativeBalance = account.balances.find(
        (b) => b.asset_type === "native"
      );

      return {
        address: publicKey,
        balance: nativeBalance?.balance ?? "0",
      };
    } catch (error) {
      console.error("Account error:", error);

      if (error.response?.status === 404) {
        const publicKey = await getPublicKey();

        return {
          address: publicKey,
          balance: "0 (akun baru)",
        };
      }

      return null;
    }
  };

  // 💸 Kirim donasi
  const donate = async (amount) => {
    const sender = await getPublicKey();

    if (!donationAddress) {
      throw new Error("Alamat donasi belum diset di .env");
    }

    if (!amount || amount <= 0) {
      throw new Error("Jumlah tidak valid");
    }

    const xlmAmount = (amount / 10000000).toString();

    // 1. Load account
    const account = await server.loadAccount(sender);

    // 2. Build transaction
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: donationAddress,
          asset: StellarSdk.Asset.native(),
          amount: xlmAmount,
        })
      )
      .setTimeout(30)
      .build();

    // 3. Convert ke XDR
    const xdr = tx.toXDR();

    // 4. Sign via Freighter
    const signedXDR = await signTransaction(xdr, networkPassphrase);

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      networkPassphrase
    );

    // 5. Submit
    return await server.submitTransaction(signedTx);
  };

  return {
    getAccountInfo,
    donate,
  };
};
import { requestAccess, signTransaction } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

export const useContract = () => {
  const server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org"
  );

  const networkPassphrase = StellarSdk.Networks.TESTNET;

  const donationAddress = import.meta.env.VITE_DONATION_ADDRESS;

  const getPublicKey = async () => {
    const result = await requestAccess();
    if (!result?.address) throw new Error("Gagal akses wallet");
    return result.address;
  };

  const donate = async (amount) => {
    try {
      const sender = await getPublicKey();

      if (!donationAddress) {
        throw new Error("Donation address belum diset di .env");
      }

      if (!amount || amount <= 0) {
        throw new Error("Jumlah tidak valid");
      }

      // convert stroop → XLM
      const xlmAmount = (amount / 10000000).toString();

      // 1. Load account sender
      const account = await server.loadAccount(sender);

      // 2. Build transaction
      const transaction = new StellarSdk.TransactionBuilder(account, {
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
      const xdr = transaction.toXDR();

      // 4. Sign pakai Freighter
      const signedXDR = await signTransaction(xdr, networkPassphrase);

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        networkPassphrase
      );

      // 5. Submit ke network
      const result = await server.submitTransaction(signedTx);

      console.log("TX SUCCESS:", result);

      alert("Donasi berhasil 🚀");
    } catch (error) {
      console.error("Donate error:", error);
      alert("Donasi gagal: " + error.message);
    }
  };

  return { donate };
};
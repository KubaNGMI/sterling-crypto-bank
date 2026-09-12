// ===========================================================================
// Demo mode — the one switch that decides whether this app admits it's a demo.
//
// Sterling Crypto Bank is a portfolio piece. It looks like a bank, asks for
// the things a bank asks for (government ID, proof of funds, bank details) and
// shows a real crypto address to send money to. Anyone who takes it at face
// value could lose documents or funds, so while this is a demo it has to say
// so, in front of every surface where that mistake is possible.
//
// FLIP THIS TO false AND EVERY NOTICE DISAPPEARS AT ONCE.
//
// That is a one-line change on purpose — but read DEMO.md before you make it.
// The notices are the cosmetic half. The substantive half is a list of values
// and behaviours that are currently fake and must be replaced with real ones,
// and no boolean can do that for you.
// ===========================================================================

export const DEMO_MODE = true;

// Copy per surface. Each is short, specific to the risk on that screen, and
// written to be read by someone who is about to hand something over.
//
// `title` is the bolded lead-in; `body` follows it in the same paragraph.
export const DEMO_NOTICES = {
  // Highest stakes on the site: a real, valid address is displayed and the
  // instruction is to send crypto to it. A transfer here is irreversible and
  // nothing credits back.
  deposit: {
    title: "Demo — do not send funds.",
    body:
      "This is a portfolio project, not a licensed exchange or bank. The address " +
      "shown is not a customer deposit address and anything sent to it is gone " +
      "for good. Balances in this app are simulated.",
  },

  // Government ID, a selfie holding it, and a bank statement. The most
  // sensitive personal data the app asks for.
  identity: {
    title: "Demo — do not upload real ID.",
    body:
      "This is a portfolio project. Files go to a private storage bucket that has " +
      "not been reviewed for compliance, security or fraud handling. Upload " +
      "placeholder images only. A real deployment would use a licensed identity " +
      "provider (Stripe Identity, Persona, Veriff) rather than raw file storage.",
  },

  // Payslips, brokerage statements, deeds — financial documents that identify
  // real accounts and real counterparties.
  proofOfFunds: {
    title: "Demo — use placeholder documents.",
    body:
      "This is a portfolio project. Don't upload real financial statements; the " +
      "storage behind this has not been reviewed for compliance or security.",
  },

  // Account number, sort code, IBAN — enough to identify a real bank account.
  bankDetails: {
    title: "Demo — use placeholder details.",
    body:
      "This is a portfolio project. Don't enter real bank account details; " +
      "nothing here is connected to a payment network.",
  },

  // A plausible-looking IBAN presented as somewhere to receive EUR. It is
  // invented, and money sent to it goes nowhere.
  euAccount: {
    title: "Demo — not a real account.",
    body:
      "This IBAN and BIC are invented example values, identical for every user. " +
      "No transfer to them will arrive anywhere.",
  },

  // The front door. Sets expectations before anyone invests effort in signing
  // up, rather than warning them once they're already handing things over.
  auth: {
    title: "Demo.",
    body:
      "Sterling Crypto Bank is a portfolio project, not a real bank. Don't use a " +
      "password you use elsewhere, and don't send funds or upload real documents.",
  },

  // Buying and selling against live prices with simulated money.
  trading: {
    title: "Demo — simulated trading.",
    body:
      "Prices are real market data, but no order reaches a venue and no position " +
      "you see here exists.",
  },
};

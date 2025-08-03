// scripts/generateWallet.js
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');

console.log('🔑 Generating new Sui wallet for faucet...\n');

// Generate a random keypair
const keypair = new Ed25519Keypair();

// Get address and private key
const address = keypair.getPublicKey().toSuiAddress();
const privateKey = keypair.getSecretKey(); // This returns the Sui-formatted private key

console.log('📝 Wallet Details:');
console.log('================');
console.log(`Address: ${address}`);
console.log(`Private Key: ${privateKey}`);
console.log(`Private Key Length: ${privateKey.length} characters`);

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('- Keep the private key SECRET and secure');
console.log('- Do not commit private keys to version control');
console.log('- Use environment variables for private keys');

console.log('\n📋 Next Steps:');
console.log('1. Copy the private key to your .env file as FAUCET_PRIVATE_KEY');
console.log('2. Fund this address with testnet SUI tokens');
console.log('3. Start your faucet backend');

console.log('\n🌐 Fund this wallet with testnet tokens:');
console.log(`- Visit: https://faucet.sui.io/`);
console.log(`- Or use Discord: !faucet ${address}`);

const envContent = `
# Add this to your .env file:
FAUCET_PRIVATE_KEY=${privateKey}
`;

console.log('\n📁 .env file content:');
console.log(envContent);

console.log('\n✅ Wallet generated successfully!');
console.log('🔧 Use the private key as-is (starts with "suiprivkey1q...")');

import bcrypt from "bcrypt";

const password = process.argv[2];
if (!password) {
  console.error("Usage : npm run hash-password -- <mot_de_passe>");
  process.exit(1);
}

console.log(await bcrypt.hash(password, 10));

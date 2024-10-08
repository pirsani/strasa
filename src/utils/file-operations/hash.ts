async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer(); // Read file as ArrayBuffer
  const hashBuffer = await crypto.subtle.digest("MD5", arrayBuffer); // Hash the ArrayBuffer
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(""); // Convert to hex string
  return hashHex;
}

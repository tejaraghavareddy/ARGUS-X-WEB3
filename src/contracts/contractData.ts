export const CONTRACT_ADDRESS = '0x71C56d8d6727786B6fD8df864019aDb9b265d677';

export const SOLIDITY_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IERC5192 Minimal Non-Transferable / Soulbound NFT Interface
 * @notice Standard interface for Soulbound Tokens (EIP-5192)
 */
interface IERC5192 {
    /// @notice Emitted when the locking status of a token is initialized or changed.
    event Locked(uint256 indexed tokenId);
    
    /// @notice Emitted if token is unlocked (not used here as certificates are permanently bound).
    event Unlocked(uint256 indexed tokenId);

    /// @notice Returns the locking status of an NFT.
    /// @param tokenId The identifier for an NFT.
    /// @return True if the token is locked, false if unlocked.
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title SoulboundCertificate
 * @notice Non-transferable academic and professional credentials issued by whitelisted institutions.
 * Stored with verifiable IPFS metadata on-chain.
 */
contract SoulboundCertificate is ERC721URIStorage, Ownable, IERC5192 {
    uint256 private _nextTokenId = 1;

    struct IssuerInfo {
        bool isWhitelisted;
        string name;
        string organization;
        string website;
    }

    // Mapping from issuer wallet address to institution details
    mapping(address => IssuerInfo) public issuers;
    
    // Mapping from tokenId to issuing address
    mapping(uint256 => address) public certificateIssuer;
    
    // Mapping from tokenId to IPFS multihash reference
    mapping(uint256 => string) public certificateIpfsHash;

    // Mapping to easily retrieve all certificate token IDs for a student wallet
    mapping(address => uint256[]) private _studentCertificates;

    // Events
    event CertificateMinted(
        address indexed student,
        uint256 indexed tokenId,
        string ipfsHash,
        address indexed issuer
    );
    event IssuerAuthorized(address indexed issuer, string organization);
    event IssuerRevoked(address indexed issuer);

    modifier onlyAuthorizedIssuer() {
        require(
            issuers[msg.sender].isWhitelisted || msg.sender == owner(),
            "SoulboundCert: Caller is not an authorized issuer"
        );
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}

    /**
     * @notice Whitelist or revoke an educational institution / issuer
     */
    function setIssuerStatus(
        address issuer,
        bool status,
        string memory issuerName,
        string memory organization,
        string memory website
    ) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        issuers[issuer] = IssuerInfo({
            isWhitelisted: status,
            name: issuerName,
            organization: organization,
            website: website
        });

        if (status) {
            emit IssuerAuthorized(issuer, organization);
        } else {
            emit IssuerRevoked(issuer);
        }
    }

    /**
     * @notice Mint a permanent, soulbound certificate to a student wallet
     * @dev Only whitelisted issuer addresses can call this function
     * @param student The recipient wallet address
     * @param ipfsHash The IPFS content identifier (CID) where certificate metadata is pinned
     */
    function mintCertificate(
        address student,
        string memory ipfsHash
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(student != address(0), "Cannot mint to zero address");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");

        uint256 tokenId = _nextTokenId++;
        
        // Mint token to student
        _safeMint(student, tokenId);
        
        // Form the standard IPFS URI
        string memory uri = string(abi.encodePacked("ipfs://", ipfsHash));
        _setTokenURI(tokenId, uri);

        // Record metadata references
        certificateIssuer[tokenId] = msg.sender;
        certificateIpfsHash[tokenId] = ipfsHash;
        _studentCertificates[student].push(tokenId);

        // Emit EIP-5192 Locked event - soulbound tokens are permanently locked
        emit Locked(tokenId);
        emit CertificateMinted(student, tokenId, ipfsHash, msg.sender);

        return tokenId;
    }

    /**
     * @notice Checks if a token is locked (EIP-5192 standard).
     * @dev All valid minted certificates are permanently soulbound.
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    /**
     * @notice Overrides OpenZeppelin ERC721 _update hook to strictly prohibit transfers.
     * @dev Allows minting (from == 0) and burning (to == 0), but REVERTS any transfer attempts.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // If neither 'from' nor 'to' is zero address, this is an attempted transfer!
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Token transfers are prohibited. Certificate is non-transferable.");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Returns all certificate token IDs issued to a specific student wallet
     */
    function getCertificatesByStudent(address student) external view returns (uint256[] memory) {
        return _studentCertificates[student];
    }

    /**
     * @notice ERC165 interface support for EIP-5192 and ERC721
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (bool)
    {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }
}`;

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'student', type: 'address' },
      { internalType: 'string', name: 'ipfsHash', type: 'string' }
    ],
    name: 'mintCertificate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'locked',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'issuer', type: 'address' }],
    name: 'issuers',
    outputs: [
      { internalType: 'bool', name: 'isWhitelisted', type: 'bool' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'organization', type: 'string' },
      { internalType: 'string', name: 'website', type: 'string' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'getCertificatesByStudent',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

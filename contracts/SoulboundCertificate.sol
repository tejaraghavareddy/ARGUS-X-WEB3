// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundCertificate is ERC721, Ownable {
    error NotAuthorizedIssuer();
    error InvalidRecipient();
    error InvalidIssuer();
    error InvalidMetadataURI();
    error CertificateDoesNotExist();
    error AlreadyRevoked();
    error NotAuthorizedToRevoke();
    error SoulboundTransferNotAllowed();
    error IssuerAlreadyAdded();
    error IssuerNotFound();

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string metadataURI
    );
    event CertificateRevoked(uint256 indexed tokenId, address indexed issuer);
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    struct Certificate {
        address recipient;
        address issuer;
        string metadataURI;
        uint256 issuedAt;
        bool revoked;
    }

    uint256 private _nextTokenId;
    mapping(address => bool) private _issuers;
    mapping(uint256 => Certificate) private _certificates;
    mapping(address => uint256[]) private _issuerTokens;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(address => uint256) private _issuedCount;
    mapping(address => uint256) private _revokedCount;

    constructor() ERC721("SoulCert", "SCERT") Ownable(msg.sender) {
        _issuers[msg.sender] = true;
        emit IssuerAdded(msg.sender);
    }

    modifier onlyIssuer() {
        if (!_issuers[msg.sender]) revert NotAuthorizedIssuer();
        _;
    }

    function addIssuer(address issuer) external onlyOwner {
        if (issuer == address(0)) revert InvalidIssuer();
        if (_issuers[issuer]) revert IssuerAlreadyAdded();
        _issuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function removeIssuer(address issuer) external onlyOwner {
        if (!_issuers[issuer]) revert IssuerNotFound();
        _issuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    function isIssuer(address issuer) external view returns (bool) {
        return _issuers[issuer];
    }

    function mintCertificate(
        address recipient,
        string calldata metadataURI
    ) external onlyIssuer returns (uint256) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (bytes(metadataURI).length == 0) revert InvalidMetadataURI();

        uint256 tokenId = ++_nextTokenId;
        _safeMint(recipient, tokenId);

        _certificates[tokenId] = Certificate({
            recipient: recipient,
            issuer: msg.sender,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            revoked: false
        });
        _issuerTokens[msg.sender].push(tokenId);
        _ownerTokens[recipient].push(tokenId);
        _issuedCount[msg.sender] += 1;

        emit CertificateIssued(tokenId, recipient, msg.sender, metadataURI);
        return tokenId;
    }

    function revokeCertificate(uint256 tokenId) external {
        Certificate storage cert = _certificates[tokenId];
        if (cert.recipient == address(0)) revert CertificateDoesNotExist();
        if (cert.revoked) revert AlreadyRevoked();
        if (msg.sender != cert.issuer && msg.sender != owner()) {
            revert NotAuthorizedToRevoke();
        }

        cert.revoked = true;
        _revokedCount[cert.issuer] += 1;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    function isRevoked(uint256 tokenId) external view returns (bool) {
        if (_certificates[tokenId].recipient == address(0)) {
            revert CertificateDoesNotExist();
        }
        return _certificates[tokenId].revoked;
    }

    function getCertificate(
        uint256 tokenId
    )
        external
        view
        returns (
            uint256 id,
            address recipient,
            address issuer,
            string memory metadataURI,
            uint256 issuedAt,
            bool revoked
        )
    {
        Certificate storage cert = _certificates[tokenId];
        if (cert.recipient == address(0)) revert CertificateDoesNotExist();
        return (
            tokenId,
            cert.recipient,
            cert.issuer,
            cert.metadataURI,
            cert.issuedAt,
            cert.revoked
        );
    }

    function getIssuerStats(
        address issuer
    ) external view returns (uint256 issued, uint256 revoked, uint256 active) {
        issued = _issuedCount[issuer];
        revoked = _revokedCount[issuer];
        active = issued - revoked;
    }

    function tokensOfIssuer(address issuer) external view returns (uint256[] memory) {
        return _issuerTokens[issuer];
    }

    function tokensOfOwner(address account) external view returns (uint256[] memory) {
        return _ownerTokens[account];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _certificates[tokenId].metadataURI;
    }

    function approve(address, uint256) public pure override {
        revert SoulboundTransferNotAllowed();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundTransferNotAllowed();
    }

    function transferFrom(address, address, uint256) public pure override {
        revert SoulboundTransferNotAllowed();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert SoulboundTransferNotAllowed();
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferNotAllowed();
        }
        return super._update(to, tokenId, auth);
    }
}

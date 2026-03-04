// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateContract {
    struct Certificate {
        string certificateID;
        string studentName;
        string university;
        string department;
        string course;
        uint256 cgpa;
        string issueDate;
        string hash;
        string status;
    }

    mapping(string => Certificate) private certificates;
    mapping(string => bool) private certificateExists;

    event CertificateCreated(string certificateID, string studentName);
    event CertificateUpdated(string certificateID);
    event CertificateRevoked(string certificateID);

    function createCertificate(
        string memory certificateID,
        string memory studentName,
        string memory university,
        string memory department,
        string memory course,
        uint256 cgpa,
        string memory issueDate,
        string memory hash
    ) public {
        require(!certificateExists[certificateID], "Certificate already exists");

        certificates[certificateID] = Certificate(
            certificateID, studentName, university, department,
            course, cgpa, issueDate, hash, "valid"
        );

        certificateExists[certificateID] = true;
        emit CertificateCreated(certificateID, studentName);
    }

    function readCertificate(string memory certificateID) public view returns (Certificate memory) {
        Certificate memory cert = certificates[certificateID];
        require(bytes(cert.studentName).length > 0, "Certificate not found");
        return cert;
    }

    function updateCertificate(
        string memory certificateID,
        string memory hash,
        string memory course,
        string memory department,
        uint256 cgpa,
        string memory studentName
    ) public {
        require(certificateExists[certificateID], "Certificate does not exist");
        Certificate storage cert = certificates[certificateID];

        cert.hash = hash;
        if (bytes(course).length > 0) cert.course = course;
        if (bytes(department).length > 0) cert.department = department;
        if (cgpa > 0) cert.cgpa = cgpa;
        if (bytes(studentName).length > 0) cert.studentName = studentName;

        emit CertificateUpdated(certificateID);
    }

    function verifyCertificate(string memory certificateID, string memory providedHash) public view returns (bool) {
        require(certificateExists[certificateID], "Certificate does not exist");
        Certificate memory cert = certificates[certificateID];
        return (
            keccak256(abi.encodePacked(cert.hash)) == keccak256(abi.encodePacked(providedHash)) &&
            keccak256(abi.encodePacked(cert.status)) == keccak256(abi.encodePacked("valid"))
        );
    }

    function revokeCertificate(string memory certificateID) public {
        require(certificateExists[certificateID], "Certificate does not exist");
        certificates[certificateID].status = "revoked";
        emit CertificateRevoked(certificateID);
    }
}

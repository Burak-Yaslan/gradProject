import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

// Defining contract variable outside
const provider = new ethers.providers.Web3Provider(window.ethereum);


let contract;

console.log("Contract profile created succesfully");

window.connect = async function () {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("connectButton").innerHTML = "Connected !!!";

    // Loop for making other function visible only after connecting metamask.
    let elements = document.getElementsByClassName("requires-connection");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "block";
    }
    const signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    console.log("Contract profile created successfully");
  } else {
    document.getElementById("connectButton").innerHTML =
      "Please install metamask";
  }
};

window.createNewPoll = async function () {
  if (contract) {
    let tx = await contract.createNewPoll();
    console.log("New Poll created successfully...");
  } else {
    console.error("Contract is not defined");
  }
};

window.represent = async function () {
  const candidateName = document.getElementById("candidateName").value;
  const pollId = document.getElementById("pollId").value;

  if (contract) {
    let tx = await contract.representate(candidateName, pollId);
    console.log("Transaction initiated correctly...");
  } else {
    console.error("Contract is not defined");
  }
};

window.vote = async function () {
  const voteCandidateName = document.getElementById("voteCandidateName").value;
  const pollId = document.getElementById("pollId").value;
  const voteMessageElement = document.getElementById("voteMessage");
  let confirmation = confirm("Are you sure you want to vote for " + voteCandidateName + "?");
  if (!confirmation) {
    return;  // Stop function execution if the user clicked 'Cancel'.
  }
  if (contract) {
    try {
      let tx = await contract.vote(pollId, voteCandidateName);
      console.log("Transaction initiated correctly...");
      voteMessageElement.innerHTML = "";
    } catch (error) {
      if (
        error.message.includes(
          "execution reverted: Voter has already voted on this poll"
        )
      ) {
        voteMessageElement.innerHTML = " * You have already voted. * ";
      } else if (
        error.message.includes(
          "execution reverted: Your account is not whitelisted"
        )
      ) {
        voteMessageElement.innerHTML =
          " * You don't have permission to vote * ";
      }
    }
  } else {
    console.error("Contract is not defined");
  }
};

window.getCandidates = async function (context) {
  const pollIdElement = document.getElementById("pollId");
  if (!pollIdElement) {
    console.error("Element 'pollId' does not exist on this page");
    return;
  }
  const pollId = pollIdElement.value;
  const candidatesList = document.getElementById("candidatesList");
  if (!candidatesList) {
    console.error("Element 'candidatesList' does not exist on this page");
    return;
  }
  if (contract) {
    const candidates = await contract.getCandidates(pollId);
    candidatesList.innerHTML = "";

    if (candidates.length == 0) {
      candidatesList.innerHTML = "No candidates in this poll"; // If there are no candidates display message
    } else {
      candidatesList.innerHTML = "";
      let candidateNames = [];
      let voteCounts = [];
      let showPollNumber = document.getElementById("showPollNumber").checked;
      for (let i = 0; i < candidates.length; i++) {
        const li = document.createElement("li");
        const candidateName = candidates[i].name;
        const candidateId = candidates[i].id;
        const voteCount = candidates[i].votes;
        candidateNames.push(candidateName);
        voteCounts.push(voteCount);
        
        if (context === "voter") {
          if (showPollNumber) {
            li.appendChild(
              
              document.createTextNode(
                `${candidateName} - ID: ${candidateId} - PollNumber: ${pollId}`
              )
            );
          }else{
            li.appendChild(
              document.createTextNode(
                `${candidateName} - ID: ${candidateId}`
              )
            );
          }
        } else if (context === "admin") {
          if (showPollNumber) {
            li.appendChild(
              
              document.createTextNode(
                `${candidateName} - ID: ${candidateId} - Votes: ${voteCount} - PollNumber: ${pollId}`
              )
            );
          }else{
            li.appendChild(
              document.createTextNode(
                `${candidateName} - ID: ${candidateId} - Votes: ${voteCount}`
              )
            );
          }         
        } else {
          console.error("Invalid context provided: ", context);
          return;
        }

        candidatesList.appendChild(li);
      }
    }
  } else {
    console.error("Contract is not defined");
  }
};

window.getWinner = async function () {
  const winnerName = document.getElementById("winnerName");
  const pollId = document.getElementById("pollId").value;
  if (contract) {
    const winner = await contract.winner(pollId);
    winnerName.innerHTML = `Winner: ${winner}`;
  } else {
    console.error("Contract is not defined");
  }
};

window.closePoll = async function () {
  const pollIdInput = document.getElementById("closePollId");
  const pollId = pollIdInput.value;

  // check if the input value is not a number or is empty
  if (isNaN(pollId) || pollId === "") {
    console.error("Invalid Poll ID");
    return;
  }

  if (contract) {
    let tx = await contract.closePoll(ethers.BigNumber.from(pollId));
    console.log("Poll is closed successfully...");
    pollIdInput.value = ""; // clear the input field
  } else {
    console.error("Contract is not defined");
  }
};

window.getActivePolls = async function () {
  if (contract) {
    const activePolls = await contract.getActivePolls();
    const activePollsList = document.getElementById("activePollsList");
    activePollsList.innerHTML = ""; // clear the list first
    for (let i = 0; i < activePolls.length; i++) {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(`Poll ID: ${activePolls[i]}`));
      activePollsList.appendChild(li);
    }
  } else {
    console.error("Contract is not defined");
  }
};

window.addToWhitelist = async function () {
  const inputString = document.getElementById("whitelistInput").value;
  const addresses = inputString.split(",");

  if (contract) {
    let tx = await contract.addToWhitelist(addresses);
    console.log("Addresses added to whitelist successfully...");
  } else {
    console.error("Contract is not defined");
  }
};

import TravelCheckStakingArtifact from "../TravelCheckStaking.json";
import TravelCheckAttractionArtifact from "../TravelCheckAttraction.json";
import TravelCheckBadgeArtifact from "../TravelCheckBadge.json";

export const CONTRACT_ADDRESSES = {
  TravelCheckStaking: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  TravelCheckAttraction: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  TravelCheckBadge: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

export const CONTRACT_ABIS = {
  TravelCheckStaking: TravelCheckStakingArtifact.abi,
  TravelCheckAttraction: TravelCheckAttractionArtifact.abi,
  TravelCheckBadge: TravelCheckBadgeArtifact.abi
};

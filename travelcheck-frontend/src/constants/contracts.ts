import TravelCheckStakingArtifact from "../TravelCheckStaking.json";
import TravelCheckAttractionArtifact from "../TravelCheckAttraction.json";
import TravelCheckBadgeArtifact from "../TravelCheckBadge.json";

export const CONTRACT_ADDRESSES = {
  TravelCheckStaking: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  TravelCheckAttraction: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  TravelCheckBadge: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
};

export const CONTRACT_ABIS = {
  TravelCheckStaking: TravelCheckStakingArtifact.abi,
  TravelCheckAttraction: TravelCheckAttractionArtifact.abi,
  TravelCheckBadge: TravelCheckBadgeArtifact.abi
};

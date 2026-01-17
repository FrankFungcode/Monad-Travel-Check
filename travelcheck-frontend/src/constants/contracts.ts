import TravelCheckStakingArtifact from "../TravelCheckStaking.json";
import TravelCheckAttractionArtifact from "../TravelCheckAttraction.json";
import TravelCheckBadgeArtifact from "../TravelCheckBadge.json";

export const CONTRACT_ADDRESSES = {
  TravelCheckStaking: "0xd40Faaa886B9108767C825272c60cfBe0E815B1F",
  TravelCheckAttraction: "0xf080924262883AE9888731A9Ef90AAe47206C54A",
  TravelCheckBadge: "0x91146a0632b88498107f62f82410B58476dE1c53"
};

export const CONTRACT_ABIS = {
  TravelCheckStaking: TravelCheckStakingArtifact.abi,
  TravelCheckAttraction: TravelCheckAttractionArtifact.abi,
  TravelCheckBadge: TravelCheckBadgeArtifact.abi
};

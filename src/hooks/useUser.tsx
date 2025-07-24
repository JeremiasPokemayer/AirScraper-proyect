import React, { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { userAtom } from "../atoms";
import { SetStateAction } from "react";

type User = {
  userLat: any;
  userLng: any;
  Adults?: any;
  Childrens?: any;
  Infants?: any;
  cabinClass?: any;
  sortedBy?: any;
};

export const useUser = (): [User, React.Dispatch<SetStateAction<User>>] => {
  return useAtom(userAtom);
};

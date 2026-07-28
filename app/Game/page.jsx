/*
Author: abrham solomon
Author: Robel azanaw
contactEmail:africansolutions.abrham@gmail.com
contact Address: +251977490753;
African technology solutions PLC
*/
"use client";
import images from "@/components/assets/temp3.png";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import "./styles.css";
import {
  saveAudioToIndexedDB,
  getAudioFromIndexedDB,
  clearDatabase,
  checkAudioFilesLoaded,
} from "../../lib/dexieDatabase";

//---------------------------------------------------------------------------------------------
import { useSession } from "next-auth/react";
import axios from "axios";
import { signOut } from "next-auth/react";
import { useSharedCardSelection } from "@/lib/useSharedCardSelection";
import { dbCards, TOTAL_CARDS, isValidCardId } from "@/lib/bingoCards";

//---------------------------------------------------------------------------------------------

const Bingo = () => {
  //--------------------------Robel----------------------------------------------------
  const { data: session, status } = useSession();
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [shopCommissionRate, setShopCommissionRate] = useState(0.2); // Default 20%

  //---------------------------</Robel>-----------------------------------------------

  useEffect(() => {
    async function fetchShopCommissionRate() {
      if (!session?.user?.shopId) return;
      try {
        const response = await axios.get(`/api/shops/${session.user.shopId}`);
        if (response.data?.shopCommissionRate !== undefined) {
          setShopCommissionRate(response.data.shopCommissionRate);
        }
      } catch (error) {
        console.error("Error fetching shop commission rate:", error);
        setShopCommissionRate(0.2);
      }
    }
    fetchShopCommissionRate();
  }, [session?.user?.shopId]);

  const [betNumbers, setBetNumbers] = useState([]); // to be passed from the intial
  const [medebAmount, setMedebAmount] = useState(20); //
  const applyingRemoteRef = useRef(false);

  const {
    locked: selectionLocked,
    clearCards: syncClearCards,
    lockSelection,
    unlockSelection,
    setCards: syncSetCards,
    openSelection,
    closeSelection,
  } = useSharedCardSelection({
    shopId: session?.user?.shopId,
    enabled: status === "authenticated" && !!session?.user?.shopId,
    pollMs: 400,
    onRemoteChange: (cards) => {
      applyingRemoteRef.current = true;
      setBetNumbers(cards);
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });
    },
  });

  // Keep FloorGuy selection open while cashier is on this page (not mid-call).
  // Re-open on an interval so Strict Mode / cleanup races cannot leave it closed.
  const selectionSessionRef = useRef(0);
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.shopId) return;

    const sessionGen = ++selectionSessionRef.current;

    const keepOpen = () => {
      const gameAlreadyActive =
        localStorage.getItem("gameScreenActive") === "true";
      if (gameAlreadyActive) return;
      openSelection().catch((err) =>
        console.error("open selection failed", err),
      );
    };

    keepOpen();
    const keepAliveId = window.setInterval(keepOpen, 1500);

    return () => {
      window.clearInterval(keepAliveId);
      window.setTimeout(() => {
        if (selectionSessionRef.current !== sessionGen) return;
        closeSelection().catch(() => {});
      }, 400);
    };
  }, [status, session?.user?.shopId, openSelection, closeSelection]);

  let maxGen = 75; // Number of random numbers to generate
  const [interval, setIntervalValue] = useState(5); // Interval in milliseconds
  const [numbers, setNumbers] = useState([]); // Array to store generated numbers

  const [winnerList, setWinnerList] = useState([]);
  const [winnerNumbers, setWinnerNumbers] = useState([]); // the official winner with the current to call bingo
  const [additionalWinnerNumbers, setAdditionalWinnerNumbers] = useState([]); // the non official winner with out the current call to bingo
  const [lockedCards, setLockedCards] = useState([]); // to disable cards
  const [narator, setNarator] = useState("am"); // to select voice
  const [commusion, setCommusion] = useState(6);

  const [isGenerating, setIsGenerating] = useState(false); // To track if numbers are being generated
  const [isPaused, setIsPaused] = useState(true); // To track if generation is paused
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffling, startShuffle] = useState(false);

  const [cardCheckToRender, setCardCheckToRender] = useState(false);

  const [gameScreenActive, setGameScreenActive] = useState(false);
  const soundStartRef = useRef(null); //referance for one sound object

  // sound test
  const [voices, setVoices] = useState([]);
  const [text, setText] = useState("b11");
  const [speaking, setSpeaking] = useState(false);

  let bingoState = useRef(false);

  // audio intializations
  const [startAudio, setStartAudio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [stopAudio, setStopAudio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [shuffleAudio, setShuffleAudio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [bingoAudio, setBingoAudio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );

  const [b1Audio, setB1Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b2Audio, setB2Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b3Audio, setB3Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b4Audio, setB4Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b5Audio, setB5Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b6Audio, setB6Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b7Audio, setB7Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b8Audio, setB8Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b9Audio, setB9Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b10Audio, setB10Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b11Audio, setB11Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b12Audio, setB12Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b13Audio, setB13Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b14Audio, setB14Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [b15Audio, setB15Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );

  const [i16Audio, setI16Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i17Audio, setI17Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i18Audio, setI18Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i19Audio, setI19Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i20Audio, setI20Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i21Audio, setI21Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i22Audio, setI22Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i23Audio, setI23Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i24Audio, setI24Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i25Audio, setI25Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i26Audio, setI26Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i27Audio, setI27Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i28Audio, setI28Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i29Audio, setI29Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [i30Audio, setI30Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );

  const [n31Audio, setN31Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n32Audio, setN32Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n33Audio, setN33Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n34Audio, setN34Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n35Audio, setN35Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n36Audio, setN36Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n37Audio, setN37Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n38Audio, setN38Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n39Audio, setN39Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n40Audio, setN40Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n41Audio, setN41Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n42Audio, setN42Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n43Audio, setN43Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n44Audio, setN44Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [n45Audio, setN45Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );

  const [g46Audio, setG46Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g47Audio, setG47Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g48Audio, setG48Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g49Audio, setG49Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g50Audio, setG50Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g51Audio, setG51Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g52Audio, setG52Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g53Audio, setG53Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g54Audio, setG54Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g55Audio, setG55Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g56Audio, setG56Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g57Audio, setG57Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g58Audio, setG58Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g59Audio, setG59Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [g60Audio, setG60Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );

  const [o61Audio, setO61Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o62Audio, setO62Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o63Audio, setO63Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o64Audio, setO64Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o65Audio, setO65Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o66Audio, setO66Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o67Audio, setO67Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o68Audio, setO68Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o69Audio, setO69Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o70Audio, setO70Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o71Audio, setO71Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o72Audio, setO72Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o73Audio, setO73Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o74Audio, setO74Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );
  const [o75Audio, setO75Audio] = useState(
    typeof Audio !== "undefined" && new Audio(),
  );

  // Handler for the range input change
  const handleRangeChange = (event) => {
    let val = setIntervalValue(event.target.value); // Update state with the new value
  };

  useEffect(() => {
    if (gameId) {
    }
  }, [gameId]);

  // Function to retrieve audio from IndexedDB

  const loadAudio = async () => {
    const startSoundUrl = await getAudioFromIndexedDB("start");
    const stopSoundUrl = await getAudioFromIndexedDB("stop");
    const bingoSoundUrl = await getAudioFromIndexedDB("bingo");
    const shuffleSoundUrl = await getAudioFromIndexedDB("shuffle");
    const b1Audio = await getAudioFromIndexedDB("b1Audio");
    const b2Audio = await getAudioFromIndexedDB("b2Audio");
    const b3Audio = await getAudioFromIndexedDB("b3Audio");
    const b4Audio = await getAudioFromIndexedDB("b4Audio");
    const b5Audio = await getAudioFromIndexedDB("b5Audio");
    const b6Audio = await getAudioFromIndexedDB("b6Audio");
    const b7Audio = await getAudioFromIndexedDB("b7Audio");
    const b8Audio = await getAudioFromIndexedDB("b8Audio");
    const b9Audio = await getAudioFromIndexedDB("b9Audio");
    const b10Audio = await getAudioFromIndexedDB("b10Audio");
    const b11Audio = await getAudioFromIndexedDB("b11Audio");
    const b12Audio = await getAudioFromIndexedDB("b12Audio");
    const b13Audio = await getAudioFromIndexedDB("b13Audio");
    const b14Audio = await getAudioFromIndexedDB("b14Audio");
    const b15Audio = await getAudioFromIndexedDB("b15Audio");
    const i16Audio = await getAudioFromIndexedDB("i16Audio");
    const i17Audio = await getAudioFromIndexedDB("i17Audio");
    const i18Audio = await getAudioFromIndexedDB("i18Audio");
    const i19Audio = await getAudioFromIndexedDB("i19Audio");
    const i20Audio = await getAudioFromIndexedDB("i20Audio");
    const i21Audio = await getAudioFromIndexedDB("i21Audio");
    const i22Audio = await getAudioFromIndexedDB("i22Audio");
    const i23Audio = await getAudioFromIndexedDB("i23Audio");
    const i24Audio = await getAudioFromIndexedDB("i24Audio");
    const i25Audio = await getAudioFromIndexedDB("i25Audio");
    const i26Audio = await getAudioFromIndexedDB("i26Audio");
    const i27Audio = await getAudioFromIndexedDB("i27Audio");
    const i28Audio = await getAudioFromIndexedDB("i28Audio");
    const i29Audio = await getAudioFromIndexedDB("i29Audio");
    const i30Audio = await getAudioFromIndexedDB("i30Audio");
    const n31Audio = await getAudioFromIndexedDB("n31Audio");
    const n32Audio = await getAudioFromIndexedDB("n32Audio");
    const n33Audio = await getAudioFromIndexedDB("n33Audio");
    const n34Audio = await getAudioFromIndexedDB("n34Audio");
    const n35Audio = await getAudioFromIndexedDB("n35Audio");
    const n36Audio = await getAudioFromIndexedDB("n36Audio");
    const n37Audio = await getAudioFromIndexedDB("n37Audio");
    const n38Audio = await getAudioFromIndexedDB("n38Audio");
    const n39Audio = await getAudioFromIndexedDB("n39Audio");
    const n40Audio = await getAudioFromIndexedDB("n40Audio");
    const n41Audio = await getAudioFromIndexedDB("n41Audio");
    const n42Audio = await getAudioFromIndexedDB("n42Audio");
    const n43Audio = await getAudioFromIndexedDB("n43Audio");
    const n44Audio = await getAudioFromIndexedDB("n44Audio");
    const n45Audio = await getAudioFromIndexedDB("n45Audio");
    const g46Audio = await getAudioFromIndexedDB("g46Audio");
    const g47Audio = await getAudioFromIndexedDB("g47Audio");
    const g48Audio = await getAudioFromIndexedDB("g48Audio");
    const g49Audio = await getAudioFromIndexedDB("g49Audio");
    const g50Audio = await getAudioFromIndexedDB("g50Audio");
    const g51Audio = await getAudioFromIndexedDB("g51Audio");
    const g52Audio = await getAudioFromIndexedDB("g52Audio");
    const g53Audio = await getAudioFromIndexedDB("g53Audio");
    const g54Audio = await getAudioFromIndexedDB("g54Audio");
    const g55Audio = await getAudioFromIndexedDB("g55Audio");
    const g56Audio = await getAudioFromIndexedDB("g56Audio");
    const g57Audio = await getAudioFromIndexedDB("g57Audio");
    const g58Audio = await getAudioFromIndexedDB("g58Audio");
    const g59Audio = await getAudioFromIndexedDB("g59Audio");
    const g60Audio = await getAudioFromIndexedDB("g60Audio");
    const o61Audio = await getAudioFromIndexedDB("o61Audio");
    const o62Audio = await getAudioFromIndexedDB("o62Audio");
    const o63Audio = await getAudioFromIndexedDB("o63Audio");
    const o64Audio = await getAudioFromIndexedDB("o64Audio");
    const o65Audio = await getAudioFromIndexedDB("o65Audio");
    const o66Audio = await getAudioFromIndexedDB("o66Audio");
    const o67Audio = await getAudioFromIndexedDB("o67Audio");
    const o68Audio = await getAudioFromIndexedDB("o68Audio");
    const o69Audio = await getAudioFromIndexedDB("o69Audio");
    const o70Audio = await getAudioFromIndexedDB("o70Audio");
    const o71Audio = await getAudioFromIndexedDB("o71Audio");
    const o72Audio = await getAudioFromIndexedDB("o72Audio");
    const o73Audio = await getAudioFromIndexedDB("o73Audio");
    const o74Audio = await getAudioFromIndexedDB("o74Audio");
    const o75Audio = await getAudioFromIndexedDB("o75Audio");

    if (startSoundUrl) {
      setStartAudio(startSoundUrl);
    } else {
      return false;
    }
    if (stopSoundUrl) {
      setStopAudio(stopSoundUrl);
    } else {
      return false;
    }
    if (bingoSoundUrl) {
      setBingoAudio(bingoSoundUrl);
    } else {
      return false;
    }
    if (shuffleSoundUrl) {
      setShuffleAudio(shuffleSoundUrl);
    } else {
      return false;
    }
    if (b1Audio) {
      setB1Audio(b1Audio);
    } else {
      return false;
    }
    if (b2Audio) {
      setB2Audio(b2Audio);
    } else {
      return false;
    }
    if (b3Audio) {
      setB3Audio(b3Audio);
    } else {
      return false;
    }
    if (b4Audio) {
      setB4Audio(b4Audio);
    } else {
      return false;
    }
    if (b5Audio) {
      setB5Audio(b5Audio);
    } else {
      return false;
    }
    if (b6Audio) {
      setB6Audio(b6Audio);
    } else {
      return false;
    }
    if (b7Audio) {
      setB7Audio(b7Audio);
    } else {
      return false;
    }
    if (b8Audio) {
      setB8Audio(b8Audio);
    } else {
      return false;
    }
    if (b9Audio) {
      setB9Audio(b9Audio);
    } else {
      return false;
    }
    if (b10Audio) {
      setB10Audio(b10Audio);
    } else {
      return false;
    }
    if (b11Audio) {
      setB11Audio(b11Audio);
    } else {
      return false;
    }
    if (b12Audio) {
      setB12Audio(b12Audio);
    } else {
      return false;
    }
    if (b13Audio) {
      setB13Audio(b13Audio);
    } else {
      return false;
    }
    if (b14Audio) {
      setB14Audio(b14Audio);
    } else {
      return false;
    }
    if (b15Audio) {
      setB15Audio(b15Audio);
    } else {
      return false;
    }

    if (i16Audio) {
      setI16Audio(i16Audio);
    } else {
      return false;
    }
    if (i17Audio) {
      setI17Audio(i17Audio);
    } else {
      return false;
    }
    if (i18Audio) {
      setI18Audio(i18Audio);
    } else {
      return false;
    }
    if (i19Audio) {
      setI19Audio(i19Audio);
    } else {
      return false;
    }
    if (i20Audio) {
      setI20Audio(i20Audio);
    } else {
      return false;
    }
    if (i21Audio) {
      setI21Audio(i21Audio);
    } else {
      return false;
    }
    if (i22Audio) {
      setI22Audio(i22Audio);
    } else {
      return false;
    }
    if (i23Audio) {
      setI23Audio(i23Audio);
    } else {
      return false;
    }
    if (i24Audio) {
      setI24Audio(i24Audio);
    } else {
      return false;
    }
    if (i25Audio) {
      setI25Audio(i25Audio);
    } else {
      return false;
    }
    if (i26Audio) {
      setI26Audio(i26Audio);
    } else {
      return false;
    }
    if (i27Audio) {
      setI27Audio(i27Audio);
    } else {
      return false;
    }
    if (i28Audio) {
      setI28Audio(i28Audio);
    } else {
      return false;
    }
    if (i29Audio) {
      setI29Audio(i29Audio);
    } else {
      return false;
    }
    if (i30Audio) {
      setI30Audio(i30Audio);
    } else {
      return false;
    }

    if (n31Audio) {
      setN31Audio(n31Audio);
    } else {
      return false;
    }
    if (n32Audio) {
      setN32Audio(n32Audio);
    } else {
      return false;
    }
    if (n33Audio) {
      setN33Audio(n33Audio);
    } else {
      return false;
    }
    if (n34Audio) {
      setN34Audio(n34Audio);
    } else {
      return false;
    }
    if (n35Audio) {
      setN35Audio(n35Audio);
    } else {
      return false;
    }
    if (n36Audio) {
      setN36Audio(n36Audio);
    } else {
      return false;
    }
    if (n37Audio) {
      setN37Audio(n37Audio);
    } else {
      return false;
    }
    if (n38Audio) {
      setN38Audio(n38Audio);
    } else {
      return false;
    }
    if (n39Audio) {
      setN39Audio(n39Audio);
    } else {
      return false;
    }
    if (n40Audio) {
      setN40Audio(n40Audio);
    } else {
      return false;
    }
    if (n41Audio) {
      setN41Audio(n41Audio);
    } else {
      return false;
    }
    if (n42Audio) {
      setN42Audio(n42Audio);
    } else {
      return false;
    }
    if (n43Audio) {
      setN43Audio(n43Audio);
    } else {
      return false;
    }
    if (n44Audio) {
      setN44Audio(n44Audio);
    } else {
      return false;
    }
    if (n45Audio) {
      setN45Audio(n45Audio);
    } else {
      return false;
    }

    if (g46Audio) {
      setG46Audio(g46Audio);
    } else {
      return false;
    }
    if (g47Audio) {
      setG47Audio(g47Audio);
    } else {
      return false;
    }
    if (g48Audio) {
      setG48Audio(g48Audio);
    } else {
      return false;
    }
    if (g49Audio) {
      setG49Audio(g49Audio);
    } else {
      return false;
    }
    if (g50Audio) {
      setG50Audio(g50Audio);
    } else {
      return false;
    }
    if (g51Audio) {
      setG51Audio(g51Audio);
    } else {
      return false;
    }
    if (g52Audio) {
      setG52Audio(g52Audio);
    } else {
      return false;
    }
    if (g53Audio) {
      setG53Audio(g53Audio);
    } else {
      return false;
    }
    if (g54Audio) {
      setG54Audio(g54Audio);
    } else {
      return false;
    }
    if (g55Audio) {
      setG55Audio(g55Audio);
    } else {
      return false;
    }
    if (g56Audio) {
      setG56Audio(g56Audio);
    } else {
      return false;
    }
    if (g57Audio) {
      setG57Audio(g57Audio);
    } else {
      return false;
    }
    if (g58Audio) {
      setG58Audio(g58Audio);
    } else {
      return false;
    }
    if (g59Audio) {
      setG59Audio(g59Audio);
    } else {
      return false;
    }
    if (g60Audio) {
      setG60Audio(g60Audio);
    } else {
      return false;
    }

    if (o61Audio) {
      setO61Audio(o61Audio);
    } else {
      return false;
    }
    if (o62Audio) {
      setO62Audio(o62Audio);
    } else {
      return false;
    }
    if (o63Audio) {
      setO63Audio(o63Audio);
    } else {
      return false;
    }
    if (o64Audio) {
      setO64Audio(o64Audio);
    } else {
      return false;
    }
    if (o65Audio) {
      setO65Audio(o65Audio);
    } else {
      return false;
    }
    if (o66Audio) {
      setO66Audio(o66Audio);
    } else {
      return false;
    }
    if (o67Audio) {
      setO67Audio(o67Audio);
    } else {
      return false;
    }
    if (o68Audio) {
      setO68Audio(o68Audio);
    } else {
      return false;
    }
    if (o69Audio) {
      setO69Audio(o69Audio);
    } else {
      return false;
    }
    if (o70Audio) {
      setO70Audio(o70Audio);
    } else {
      return false;
    }
    if (o71Audio) {
      setO71Audio(o71Audio);
    } else {
      return false;
    }
    if (o72Audio) {
      setO72Audio(o72Audio);
    } else {
      return false;
    }
    if (o73Audio) {
      setO73Audio(o73Audio);
    } else {
      return false;
    }
    if (o74Audio) {
      setO74Audio(o74Audio);
    } else {
      return false;
    }
    if (o75Audio) {
      setO75Audio(o75Audio);
    } else {
      return false;
    }
  };

  //------------------------- featch balance-----
  const fetchWalletBalance = useCallback(async () => {
    if (!session?.user?.ownerId) return;

    try {
      const response = await axios.get(
        `/api/wallets/balance/${session.user.shopId}`,
      );

      if (response.data?.balance !== undefined) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  }, [session]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const checkBlockedAndWallet = async () => {
      try {
        await fetchWalletBalance();

        const response = await axios.get(
          `/api/users/getUser?userId=${session.user.id}`,
        );

        if (response.data.isBlocked) {
          toast.error("You have been blocked.");
          await signOut({ callbackUrl: "/auth/login" });
        }
      } catch (error) {
        console.error("Error during polling:", error);
      }
    };

    checkBlockedAndWallet();

    const interval = setInterval(checkBlockedAndWallet, 60000);

    return () => clearInterval(interval);
  }, [status, session, fetchWalletBalance]);

  //------------------------- featch balance-----

  useEffect(() => {
    // audio files are manupulation

    checkAudioFilesLoaded()
      .then(() => {
        loadAudio(); // Runs if the promise resolves
        document.getElementById("overlay4").style.display = "none";
      })
      .catch((error) => {
        console.error(error); // Runs if the promise rejects
      });

    // begining of local storage data reading codes

    if (typeof window !== "undefined") {
      if (localStorage.getItem("betNumbers")) {
        setBetNumbers(JSON.parse(localStorage.getItem("betNumbers")));
      }
      if (localStorage.getItem("medebAmount")) {
        setMedebAmount(JSON.parse(localStorage.getItem("medebAmount")));
      }
      if (localStorage.getItem("interval")) {
        setIntervalValue(JSON.parse(localStorage.getItem("interval")));
      }
      if (localStorage.getItem("numbers")) {
        setNumbers(JSON.parse(localStorage.getItem("numbers")));
      }
      if (localStorage.getItem("winnerList")) {
        setWinnerList(JSON.parse(localStorage.getItem("winnerList")));
      }
      if (localStorage.getItem("winnerNumbers")) {
        setWinnerNumbers(JSON.parse(localStorage.getItem("winnerNumbers")));
      }
      if (localStorage.getItem("additionalWinnerNumbers")) {
        setAdditionalWinnerNumbers(
          JSON.parse(localStorage.getItem("additionalWinnerNumbers")),
        );
      }
      if (localStorage.getItem("lockedCards")) {
        setLockedCards(JSON.parse(localStorage.getItem("lockedCards")));
      }
      if (localStorage.getItem("gameStarted")) {
        setGameStarted(JSON.parse(localStorage.getItem("gameStarted")));
      }
      if (localStorage.getItem("cardCheckToRender")) {
        setCardCheckToRender(
          JSON.parse(localStorage.getItem("cardCheckToRender")),
        );
      }

      if (localStorage.getItem("gameScreenActive")) {
        setGameScreenActive(
          JSON.parse(localStorage.getItem("gameScreenActive")),
        );
      }
    }

    //    end of local storage reading

    // check if game is already started to display game ui
    if (gameScreenActive == true) {
      document.getElementById("cardSelectionBox").style.display = "none";
      document.getElementById("containerBox").style.display = "grid";
    }

    //sound Referance
    soundStartRef.current = new Audio();

    //sound test
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  //sound test

  const speakUtterance = (text, voice, rate = 1.5) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.rate = rate; // 🔥 Set speed here (default is 1.0)
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  const narrate = async (wrdToNarate) => {
    if (speaking) return;
    setSpeaking(true);

    const nar = voices.find((v) => v.name.includes(narator));

    const words = wrdToNarate.trim().split(/\s+/);
    for (const word of words) {
      // Speak the whole word

      await speakUtterance(word, nar, 1); // Faster word
      // Spell the word character by character

      if (word.length > 2) {
        const chars = word.split("").join(" ");
        const utterance = new SpeechSynthesisUtterance(chars);
        utterance.voice = nar;
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }
    }

    setSpeaking(false);
  };

  //           start of local storage saving codes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = JSON.parse(localStorage.getItem("betNumbers"));
      let tempArray = [];
      // Only push `betNumbers` if it's neither `null` nor an empty array
      if (
        betNumbers !== null &&
        Array.isArray(betNumbers) &&
        betNumbers.length > 0
      ) {
        tempArray.push(...betNumbers); // Spread the array elements into tempArray
      }

      // Only push `result` if it's neither `null` nor an empty array
      if (result !== null && Array.isArray(result) && result.length > 0) {
        tempArray.push(...result); // Spread the array elements into tempArray
      }

      // Use Set to keep only unique values in tempArray
      tempArray = [...new Set(tempArray)];

      // Remove values from tempArray that are no longer in betNumbers
      if (betNumbers !== null && Array.isArray(betNumbers)) {
        tempArray = tempArray.filter((item) => betNumbers.includes(item));
      }

      // Set the updated array back to localStorage if it's not empty
      if (tempArray.length > 0) {
        localStorage.setItem("betNumbers", JSON.stringify(tempArray));
      } else {
        localStorage.removeItem("betNumbers");
      }
    }
  }, [betNumbers]);

  useEffect(() => {
    // to store the change medeb amout to local storage
    if (typeof window !== "undefined") {
      const result = localStorage.getItem("medebAmount");
      let tempNum;

      if (result !== null && result > 0) {
        tempNum = result;
      }
      if (medebAmount !== 20) {
        tempNum = medebAmount;
      }
      if (tempNum != null) {
        localStorage.setItem("medebAmount", JSON.stringify(tempNum));
      }
    }
  }, [medebAmount]);

  useEffect(() => {
    // to store the change interval amout to local storage
    if (typeof window !== "undefined") {
      const result = localStorage.getItem("interval");

      let tempInterval;

      if (result !== null && result > 0) {
        tempInterval = result;
      }
      if (interval != 5) {
        tempInterval = interval;
      }
      if (tempInterval != null) {
        localStorage.setItem("interval", JSON.stringify(tempInterval));
      } else {
        localStorage.removeItem("interval");
      }
    }
  }, [interval]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = JSON.parse(localStorage.getItem("numbers"));
      let tempArray = [];
      // Only push `betNumbers` if it's neither `null` nor an empty array
      if (numbers !== null && Array.isArray(numbers) && numbers.length > 0) {
        tempArray.push(...numbers); // Spread the array elements into tempArray
      }

      // Only push `result` if it's neither `null` nor an empty array
      if (result !== null && Array.isArray(result) && result.length > 0) {
        tempArray.push(...result); // Spread the array elements into tempArray
      }

      // Use Set to keep only unique values in tempArray
      tempArray = [...new Set(tempArray)];

      // Remove values from tempArray that are no longer in betNumbers
      if (numbers !== null && Array.isArray(numbers)) {
        tempArray = tempArray.filter((item) => numbers.includes(item));
      }

      // Set the updated array back to localStorage if it's not empty
      if (tempArray.length > 0) {
        localStorage.setItem("numbers", JSON.stringify(tempArray));
      } else {
        localStorage.removeItem("numbers");
      }
    }
  }, [numbers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = JSON.parse(localStorage.getItem("winnerList"));
      let tempArray = [];

      if (
        winnerList !== null &&
        Array.isArray(winnerList) &&
        winnerList.length > 0
      ) {
        tempArray.push(...winnerList); // Spread the array elements into tempArray
      }

      // Only push `result` if it's neither `null` nor an empty array
      if (result !== null && Array.isArray(result) && result.length > 0) {
        tempArray.push(...result); // Spread the array elements into tempArray
      }

      // Use Set to keep only unique values in tempArray
      tempArray = [...new Set(tempArray)];

      // Remove values from tempArray that are no longer in betNumbers
      if (winnerList !== null && Array.isArray(winnerList)) {
        tempArray = tempArray.filter((item) => winnerList.includes(item));
      }

      // Set the updated array back to localStorage if it's not empty
      if (tempArray.length > 0) {
        localStorage.setItem("winnerList", JSON.stringify(tempArray));
      } else {
        localStorage.removeItem("winnerList");
      }
    }
  }, [winnerList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = JSON.parse(localStorage.getItem("winnerNumbers"));
      let tempArray = [];

      if (
        winnerNumbers !== null &&
        Array.isArray(winnerNumbers) &&
        winnerNumbers.length > 0
      ) {
        tempArray.push(...winnerNumbers); // Spread the array elements into tempArray
      }

      // Only push `result` if it's neither `null` nor an empty array
      if (result !== null && Array.isArray(result) && result.length > 0) {
        tempArray.push(...result); // Spread the array elements into tempArray
      }

      // Use Set to keep only unique values in tempArray
      tempArray = [...new Set(tempArray)];

      // Remove values from tempArray that are no longer in betNumbers
      if (winnerNumbers !== null && Array.isArray(winnerNumbers)) {
        tempArray = tempArray.filter((item) => winnerNumbers.includes(item));
      }

      // Set the updated array back to localStorage if it's not empty
      if (tempArray.length > 0) {
        localStorage.setItem("winnerNumbers", JSON.stringify(tempArray));
      } else {
        localStorage.removeItem("winnerNumbers");
      }
    }
  }, [winnerNumbers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = JSON.parse(
        localStorage.getItem("additionalWinnerNumbers"),
      );
      let tempArray = [];

      if (
        additionalWinnerNumbers !== null &&
        Array.isArray(additionalWinnerNumbers) &&
        additionalWinnerNumbers.length > 0
      ) {
        tempArray.push(...additionalWinnerNumbers); // Spread the array elements into tempArray
      }

      // Only push `result` if it's neither `null` nor an empty array
      if (result !== null && Array.isArray(result) && result.length > 0) {
        tempArray.push(...result); // Spread the array elements into tempArray
      }

      // Use Set to keep only unique values in tempArray
      tempArray = [...new Set(tempArray)];

      // Remove values from tempArray that are no longer in betNumbers
      if (
        additionalWinnerNumbers !== null &&
        Array.isArray(additionalWinnerNumbers)
      ) {
        tempArray = tempArray.filter((item) =>
          additionalWinnerNumbers.includes(item),
        );
      }

      // Set the updated array back to localStorage if it's not empty
      if (tempArray.length > 0) {
        localStorage.setItem(
          "additionalWinnerNumbers",
          JSON.stringify(tempArray),
        );
      } else {
        localStorage.removeItem("additionalWinnerNumbers");
      }
    }
  }, [additionalWinnerNumbers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = JSON.parse(localStorage.getItem("lockedCards"));
      let tempArray = [];

      if (
        lockedCards !== null &&
        Array.isArray(lockedCards) &&
        lockedCards.length > 0
      ) {
        tempArray.push(...lockedCards); // Spread the array elements into tempArray
      }

      // Only push `result` if it's neither `null` nor an empty array
      if (result !== null && Array.isArray(result) && result.length > 0) {
        tempArray.push(...result); // Spread the array elements into tempArray
      }

      // Use Set to keep only unique values in tempArray
      tempArray = [...new Set(tempArray)];

      // Remove values from tempArray that are no longer in betNumbers
      if (lockedCards !== null && Array.isArray(lockedCards)) {
        tempArray = tempArray.filter((item) => lockedCards.includes(item));
      }

      // Set the updated array back to localStorage if it's not empty
      if (tempArray.length > 0) {
        localStorage.setItem("lockedCards", JSON.stringify(tempArray));
      } else {
        localStorage.removeItem("lockedCards");
      }
    }
  }, [lockedCards]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = localStorage.getItem("cardCheckToRender");

      let tempval;

      if (result !== null && result > 0) {
        tempval = result;
      }
      if (cardCheckToRender !== false) {
        tempval = cardCheckToRender;
      }
      if (tempval != null) {
        localStorage.setItem("cardCheckToRender", JSON.stringify(tempval));
      } else {
        localStorage.removeItem("cardCheckToRender");
      }
    }
  }, [cardCheckToRender]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = localStorage.getItem("gameStarted");

      let tempval;

      if (result !== null && result > 0) {
        tempval = result;
      }
      if (gameStarted !== false) {
        tempval = gameStarted;
      }
      if (tempval != null) {
        localStorage.setItem("gameStarted", JSON.stringify(tempval));
      } else {
        localStorage.removeItem("gameStarted");
      }
    }
  }, [gameStarted]);

  useEffect(() => {
    // check if game is already started to display game ui
    if (gameScreenActive == true) {
      document.getElementById("cardSelectionBox").style.display = "none";
      document.getElementById("containerBox").style.display = "grid";
    }
    if (typeof window !== "undefined") {
      const result = localStorage.getItem("gameScreenActive");

      let tempval;

      if (result !== null && result > 0) {
        tempval = result;
      }
      if (gameScreenActive !== false) {
        tempval = gameScreenActive;
      }
      if (tempval != null) {
        localStorage.setItem("gameScreenActive", JSON.stringify(tempval));
      } else {
        localStorage.removeItem("gameScreenActive");
      }
    }
  }, [gameScreenActive]);

  //         end of local storage saving codes

  useEffect(() => {
    let timer;
    if (isGenerating && !isPaused) {
      setNumbers((prevNumbers) => {
        if (prevNumbers.length < maxGen) {
          let newNumber;
          do {
            newNumber = Math.floor(Math.random() * 75) + 1;
          } while (prevNumbers.includes(newNumber));
          // Ensure the number is unique

          return [...prevNumbers, newNumber];
        }
      });

      timer = setInterval(() => {
        setNumbers((prevNumbers) => {
          if (prevNumbers.length < maxGen) {
            let newNumber;
            do {
              newNumber = Math.floor(Math.random() * 75) + 1;
            } while (prevNumbers.includes(newNumber));
            // Ensure the number is unique

            return [...prevNumbers, newNumber];
          } else {
            clearInterval(timer);
            setIsGenerating(false);

            return prevNumbers;
          }
        });
      }, interval * 1000); // Seconds converted into milliseconds
    }
    return () => clearInterval(timer); // Cleanup the interval on component unmount or when generating stops
  }, [isGenerating, isPaused, interval]);

  useEffect(() => {
    //testaudio
    const runNarration = async (tobeNarated) => {
      await narrate(tobeNarated);
    };

    // if (numbers.length > 0) {
    //   setIntervalValue(5);
    // }

    if (numbers.length > 0) {
      if (!isPaused) {
        //just not to play the audio on page reload

        //start play sound
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();
        const davidVoice = voices.find((voice) =>
          voice.name.includes("Microsoft David - English (United States)"),
        );

        if (soundStartRef.current.paused) {
          soundStartRef.current.src = returnAudioObject(
            numbers[numbers.length - 1],
          );

          if (narator == "am") {
            soundStartRef.current.play();
          } else {
            // test audio
            runNarration(addLetter(numbers[numbers.length - 1]));
          }
        } else if (!soundStartRef.current.paused) {
          setTimeout(() => {
            if (soundStartRef.current.paused) {
              soundStartRef.current.src = returnAudioObject(
                numbers[numbers.length - 1],
              );

              if (narator == "am") {
                soundStartRef.current.play();
              } else {
                // test audio
                runNarration(addLetter(numbers[numbers.length - 1]));
              }
            }
          }, 2000);
        }
      }

      document.getElementById(numbers[0]).style.color = "white";
      for (let x = 1; x < numbers.length; x++) {
        document.getElementById(numbers[x]).style.color = "white";
      }

      //collor change on new generation
      let x = document.getElementById(numbers[numbers.length - 1]);

      let intv = setInterval(function () {
        x.style.color = x.style.color == "black" ? "white" : "black";
      }, 500);

      setTimeout(() => {
        x.style.color = "white";
        clearInterval(intv);
      }, interval * 1000);
      // manually set the timer temporarly
    }

    // // to the mini call balls

    // if (numbers.length == 0) {
    //   document.getElementById("miniBall1").style.display = "none";
    //   document.getElementById("miniBall2").style.display = "none";
    //   document.getElementById("miniBall3").style.display = "none";
    //   document.getElementById("miniBall4").style.display = "none";
    //   document.getElementById("miniBall5").style.display = "none";
    // }
    // if (numbers.length == 1) {
    //   document.getElementById("miniBall1").style.display = "block";
    //   document.getElementById("miniBall2").style.display = "none";
    //   document.getElementById("miniBall3").style.display = "none";
    //   document.getElementById("miniBall4").style.display = "none";
    //   document.getElementById("miniBall5").style.display = "none";
    // }
    // if (numbers.length == 2) {
    //   document.getElementById("miniBall1").style.display = "block";
    //   document.getElementById("miniBall2").style.display = "block";
    //   document.getElementById("miniBall3").style.display = "none";
    //   document.getElementById("miniBall4").style.display = "none";
    //   document.getElementById("miniBall5").style.display = "none";
    // }
    // if (numbers.length == 3) {
    //   document.getElementById("miniBall1").style.display = "block";
    //   document.getElementById("miniBall2").style.display = "block";
    //   document.getElementById("miniBall3").style.display = "block";
    //   document.getElementById("miniBall4").style.display = "none";
    //   document.getElementById("miniBall5").style.display = "none";
    // }
    // if (numbers.length == 4) {
    //   document.getElementById("miniBall1").style.display = "block";
    //   document.getElementById("miniBall2").style.display = "block";
    //   document.getElementById("miniBall3").style.display = "block";
    //   document.getElementById("miniBall4").style.display = "block";
    //   document.getElementById("miniBall5").style.display = "none";
    // }
    // if (numbers.length == 5) {
    //   document.getElementById("miniBall1").style.display = "block";
    //   document.getElementById("miniBall2").style.display = "block";
    //   document.getElementById("miniBall3").style.display = "block";
    //   document.getElementById("miniBall4").style.display = "block";
    //   document.getElementById("miniBall5").style.display = "block";
    // }
  }, [numbers]);

  const handleGenerate = async () => {
    if (!gameStarted) {
      setLoading(true);
      try {
        const response = await axios.post("/api/games/commusion", {
          id: gameId,
          comm: commusion,
        });
        if (
          response.status === 404 ||
          response.status === 400 ||
          response.status === 500
        ) {
          toast("Cant not start game");
          return;
        }
      } catch (error) {
        toast("Cant not start game");
        return;
      } finally {
        setLoading(false);
      }
    }
    if (numbers.length < 75) {
      setTimeout(() => {
        setIsPaused(false); // Ensure generation starts in play mode
        setIsGenerating(true);
        setGameStarted(true);
      }, 1650);

      if (!gameStarted) {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();
        const davidVoice = voices.find((voice) =>
          voice.name.includes("Microsoft David - English (United States)"),
        );

        //start play sound
        if (soundStartRef.current.paused) {
          soundStartRef.current.src = startAudio;

          if (narator == "am") {
            soundStartRef.current.play();
          } else {
            // test audio
            const utterance = new SpeechSynthesisUtterance("game started");
            const nar = voices.find((v) => v.name.includes(narator));
            utterance.voice = nar;
            window.speechSynthesis.speak(utterance);
          }
        } else if (!soundStartRef.current.paused) {
          setTimeout(() => {
            if (soundStartRef.current.paused) {
              soundStartRef.current.src = startAudio;

              if (narator == "am") {
                soundStartRef.current.play();
              } else {
                // test audio
                const utterance = new SpeechSynthesisUtterance("game started");
                const nar = voices.find((v) => v.name.includes(narator));
                utterance.voice = nar;
                window.speechSynthesis.speak(utterance);
              }
            }
          }, 1000);
        }
      }
    }
  };

  const handlePause = () => {
    setIsPaused(true);

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const davidVoice = voices.find((voice) =>
      voice.name.includes("Microsoft David - English (United States)"),
    );
    //start play sound
    if (soundStartRef.current.paused) {
      soundStartRef.current.src = stopAudio;

      // check stop the naration before.
      window.speechSynthesis.cancel();
      if (narator == "am") {
        soundStartRef.current.play();
      } else {
        // test audio
        const utterance = new SpeechSynthesisUtterance("game paused");
        const nar = voices.find((v) => v.name.includes(narator));

        utterance.voice = nar;

        window.speechSynthesis.speak(utterance);
      }
    } else if (!soundStartRef.current.paused) {
      setTimeout(() => {
        if (soundStartRef.current.paused) {
          soundStartRef.current.src = stopAudio;

          if (narator == "am") {
            soundStartRef.current.play();
          } else {
            // test audio
            const utterance = new SpeechSynthesisUtterance("game paused");
            const nar = voices.find((v) => v.name.includes(narator));

            utterance.voice = nar;

            window.speechSynthesis.speak(utterance);
          }
        }
      }, 1000);
    }
  };

  const handlePlay = () => {
    setIsPaused(false);
  };

  const validateRow = (exp) => {
    exp = exp - 1;
    if (numbers.length > 0) {
      //validate row

      let countFive = 1;
      setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list

      for (let index = 0; index <= 24; index++) {
        if (countFive > 5) {
          setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
          countFive = 1;
          // to rest the counter
        }
        if (numbers.includes(dbCards[exp].value[index])) {
          winnerList.push(dbCards[exp].value[index]);
        }
        if (index === 12) {
          winnerList.push("FREE");
        }
        countFive++;
        if (
          winnerList.length === 5 &&
          winnerList.includes(numbers[numbers.length - 1])
        ) {
          winnerList.forEach((element) => {
            setWinnerNumbers((prevNumbers) => [...prevNumbers, element]);
          });

          setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
          countFive = 1; // to rest the counter

          bingoState = true;
        } else if (winnerList.length === 5) {
          // winner with out the current call at the winning numbers
          winnerList.forEach((element) => {
            setAdditionalWinnerNumbers((prevNumbers) => [
              ...prevNumbers,
              element,
            ]);
          });

          setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
          countFive = 1; // to rest the counter
        }
      }
      // return winnerDetails;
    }

    return false;
  };

  const validateCol = (exp) => {
    exp = exp - 1;
    if (numbers.length > 0) {
      const winnerDetails = [];
      //validate col

      let countFive = 1;
      let fiveMultiplier = 0;
      setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list

      for (let index = 0; index <= 4; index++) {
        fiveMultiplier = index;
        for (let i = 0; i <= 4; i++) {
          if (countFive > 5) {
            setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
            countFive = 1; // to rest the counter
          }

          if (i === 0) {
            fiveMultiplier = index;
          } else {
            fiveMultiplier = fiveMultiplier + 5; // for calulating the columen
          }

          if (numbers.includes(dbCards[exp].value[fiveMultiplier])) {
            winnerList.push(dbCards[exp].value[fiveMultiplier]);
          }

          if (index === 2 && i === 2) {
            winnerList.push("FREE");
          }

          countFive++;
          if (
            winnerList.length === 5 &&
            winnerList.includes(numbers[numbers.length - 1])
          ) {
            winnerList.forEach((element) => {
              setWinnerNumbers((prevNumbers) => [...prevNumbers, element]);
            });

            setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
            countFive = 1; // to rest the counter

            // to check if the winner has won by the current called call

            bingoState = true;
          } else if (winnerList.length === 5) {
            // winner with out the current call at the winning numbers
            winnerList.forEach((element) => {
              setAdditionalWinnerNumbers((prevNumbers) => [
                ...prevNumbers,
                element,
              ]);
            });

            setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
            countFive = 1; // to rest the counter
          }
        }
      }
      // return winnerDetails;
    }

    return false;
  };

  const validateCourners = (exp) => {
    exp = exp - 1;
    if (numbers.length > 0) {
      //validate fourCourners

      setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list

      for (let index = 0; index <= 24; index++) {
        if (index === 0 || index === 4 || index === 20 || index === 24)
          if (numbers.includes(dbCards[exp].value[index])) {
            winnerList.push(dbCards[exp].value[index]);
          }
      }
      if (
        winnerList.length === 4 &&
        winnerList.includes(numbers[numbers.length - 1])
      ) {
        const winnerDetails = [];

        winnerList.forEach((element) => {
          setWinnerNumbers((prevNumbers) => [...prevNumbers, element]);
        });
        setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
        // to check if the winner has won by the current called call

        bingoState = true;
      } else if (winnerList.length === 4) {
        // winner with out the current call at the winning numbers
        winnerList.forEach((element) => {
          setAdditionalWinnerNumbers((prevNumbers) => [
            ...prevNumbers,
            element,
          ]);
        });

        setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
      }
    }

    return false;
  };

  const validateBackSlash = (exp) => {
    exp = exp - 1;
    if (numbers.length > 0) {
      //validate backsslash

      setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list

      for (let index = 0; index <= 24; index++) {
        if (index === 0 || index === 6 || index === 18 || index === 24) {
          if (numbers.includes(dbCards[exp].value[index])) {
            winnerList.push(dbCards[exp].value[index]);
          }
        }

        if (index === 12) {
          winnerList.push("FREE");
        }
      }

      if (
        winnerList.length === 5 &&
        winnerList.includes(numbers[numbers.length - 1])
      ) {
        winnerList.forEach((element) => {
          setWinnerNumbers((prevNumbers) => [...prevNumbers, element]);
        });

        setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
        // to check if the winner has won by the current called call

        bingoState = true;
      } else if (winnerList.length === 5) {
        // winner with out the current call at the winning numbers
        winnerList.forEach((element) => {
          setAdditionalWinnerNumbers((prevNumbers) => [
            ...prevNumbers,
            element,
          ]);
        });

        setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
      }
    }

    return false;
  };

  const validateSlash = (exp) => {
    exp = exp - 1;
    if (numbers.length > 0) {
      //validate slash

      setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list

      for (let index = 0; index <= 24; index++) {
        if (index === 4 || index === 8 || index === 16 || index === 20) {
          if (numbers.includes(dbCards[exp].value[index])) {
            winnerList.push(dbCards[exp].value[index]);
          }
        }
        if (index === 12) {
          winnerList.push("FREE");
        }
      }
      if (
        winnerList.length === 5 &&
        winnerList.includes(numbers[numbers.length - 1])
      ) {
        winnerList.forEach((element) => {
          setWinnerNumbers((prevNumbers) => [...prevNumbers, element]);
        });

        setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
        //  return winnerDetails;
        bingoState = true;
      } else if (winnerList.length === 5) {
        // winner with out the current call at the winning numbers
        winnerList.forEach((element) => {
          setAdditionalWinnerNumbers((prevNumbers) => [
            ...prevNumbers,
            element,
          ]);
        });

        setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
      }
    }

    return false;
  };

  const validateCube = (exp) => {
    // if (numbers.length > 0) {
    //   //validate cube
    //   const recWinners = [
    //     0, 1, 5, 6, 1, 2, 6, 7, 2, 3, 7, 8, 3, 4, 8, 9, 5, 6, 10, 11, 10, 11,
    //     15, 16, 8, 9, 13, 14, 13, 14, 18, 19, 15, 16, 20, 21, 16, 17, 21, 22,
    //     17, 18, 22, 23, 18, 19, 23, 24,
    //   ];
    //   setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
    //   for (let i = 0; i <= 47; i = i + 4) {
    //     if (
    //       numbers.includes(dbCards[exp].value[recWinners[i]]) &&
    //       numbers.includes(dbCards[exp].value[recWinners[i + 1]]) &&
    //       numbers.includes(dbCards[exp].value[recWinners[i + 2]]) &&
    //       numbers.includes(dbCards[exp].value[recWinners[i + 3]])
    //     ) {
    //       winnerList.push(dbCards[exp].value[recWinners[i]]);
    //       winnerList.push(dbCards[exp].value[recWinners[i + 1]]);
    //       winnerList.push(dbCards[exp].value[recWinners[i + 2]]);
    //       winnerList.push(dbCards[exp].value[recWinners[i + 3]]);
    //     }
    //     if (winnerList.length === 4) {
    //       const winnerDetails = [winnerList];
    //
    //       setWinnerList(winnerList.splice(0, winnerList.length)); // to reset the list
    //       return winnerDetails;
    //     }
    //   }
    // }
    // return false;
  };

  function addLetter(num) {
    if (num > 0 && num <= 15) return "b" + num;
    else if (num > 15 && num <= 30) return "i" + num;
    else if (num > 30 && num <= 45) return "n" + num;
    else if (num > 45 && num <= 60) return "g" + num;
    else if (num > 60 && num <= 75) return "o" + num;
  }
  function getLetter(num) {
    if (num > 0 && num <= 15) return "B" + num;
    else if (num > 15 && num <= 30) return "I" + num;
    else if (num > 30 && num <= 45) return "N" + num;
    else if (num > 45 && num <= 60) return "G" + num;
    else if (num > 60 && num <= 75) return "o" + num;
  }

  function checkBoardOnChange() {
    const checknum = document.getElementById("cardTocheck").value;
    if (checknum > 0 && checknum <= TOTAL_CARDS) {
      setCardCheckToRender(checknum);
    }
  }
  function dispOverlay2() {
    document.getElementById("overlay2").style.display = "block";
  }

  function dispOverlay() {
    setIsPaused(true);
    const check = document.getElementById("cardTocheck").value;
    document.getElementById("haswonned").style.display = "none";

    if (check > 0 && check <= TOTAL_CARDS) {
      if (numbers.length > 0) {
        if (!lockedCards.includes(check)) {
          let exists = false;

          betNumbers.forEach((betnum) => {
            if (betnum == check) {
              exists = true;
            }
          });

          if (!exists) {
            toast("Card " + check + " is NOT Registered");
          } else {
            checkWinner(check);

            document.getElementById("overlay").style.display = "block";
          }
        } else {
          toast("Already Locked: Card " + check);
        }
      } else {
        toast("Please start game first");
      }
    } else {
      toast(`Please Enter card between 1 and ${TOTAL_CARDS}`);
    }
  }

  function checkWinner(cardCheck) {
    bingoState = false;
    setWinnerNumbers([]); // to reset the list
    setAdditionalWinnerNumbers([]);
    setWinnerList([]);

    setCardCheckToRender(cardCheck); // to set card to be displayed on winner overlay
    let count = 0;
    validation(cardCheck);
    if (bingoState == true) {
      document.getElementById("haswonned").style.display = "block";

      if (narator == "am") {
        //start play sound
        if (soundStartRef.current.paused) {
          soundStartRef.current.src = bingoAudio;
          soundStartRef.current.play();
        } else if (!soundStartRef.current.paused) {
          setTimeout(() => {
            if (soundStartRef.current.paused) {
              soundStartRef.current.src = bingoAudio;
              soundStartRef.current.play();
            }
          }, 1700);
        }
      } else {
        //start play sound
        if (soundStartRef.current.paused) {
          // test audio
          const utterance = new SpeechSynthesisUtterance("bingo");

          const nar = voices.find((v) => v.name.includes(narator));

          utterance.voice = nar;

          window.speechSynthesis.speak(utterance);
        } else if (!soundStartRef.current.paused) {
          setTimeout(() => {
            if (soundStartRef.current.paused) {
              // test audio
              const utterance = new SpeechSynthesisUtterance("bingo");

              const nar = voices.find((v) => v.name.includes(narator));

              utterance.voice = nar;

              window.speechSynthesis.speak(utterance);
            }
          }, 1700);
        }
      }

      // comussioned game

      // not to trigger databse operation for more than one winner
      if (count == 0 && gameId) {
        try {
          axios.put(`/api/games/${gameId}/update`, {
            status: "completed",
            winnerCard: cardCheck,
            numbersCalled: parseInt(numbers.length),
          });
          count++;
        } catch (error) {
          // network problem, cant save winner to db or gameid is destored already
        }
      }
    }
  }

  // function checkForWinner(card) {
  //   //reset the winner detailes of the prvious specific card

  //   if (numbers.length > 0) {
  //     // setWinnerPattren(count);
  //     let dbCard = card;

  //     if (validateCustome2(dbCard) == true) {
  //       setWinner([]);
  //       let win = {
  //         id: dbCard,
  //         pattrenkeys: validateCustome(dbCard),
  //       };
  //       setWinner((prevCards) => [...prevCards, win]);

  //     }
  //   }
  // }

  function hideOverlay() {
    document.getElementById("overlay").style.display = "none";
  }
  function hideOverlay2() {
    document.getElementById("overlay2").style.display = "none";
  }

  function validation(expected) {
    const validateR = validateRow(expected);

    const validateC = validateCol(expected);

    const validateS = validateSlash(expected);

    const validateBS = validateBackSlash(expected);

    const validateCrnr = validateCourners(expected);

    if (validateR == true) {
      return true;
    } else if (validateC == true) {
      return true;
    } else if (validateS == true) {
      return true;
    } else if (validateBS == true) {
      return true;
    } else if (validateCrnr == true) {
      return true;
    } else {
      return false;
    }
  }

  const setBetCard = (betCard) => {
    if (selectionLocked) {
      toast("Selection locked — game already started");
      return;
    }
    const next = betNumbers.includes(betCard)
      ? betNumbers.filter((item) => item !== betCard)
      : [...betNumbers, betCard];
    setBetNumbers(next);
    if (session?.user?.shopId) {
      syncSetCards(next).catch((err) => {
        console.error("sync set cards failed", err);
      });
    }
  };

  const startGame = async () => {
    if (betNumbers.length > 1) {
      if (medebAmount < 10) {
        toast("You need at least 10 birr to Bet");
      } else {
        setNumbers([]);
        setIntervalValue(5);
        setWinnerList([]);
        setWinnerNumbers([]);
        setAdditionalWinnerNumbers([]);
        setLockedCards([]);
        setNarator("am");
        setIsGenerating(false);
        setIsPaused(true);
        setGameStarted(false);
        startShuffle(false);
        setCardCheckToRender(false);

        if (typeof window !== "undefined") {
          localStorage.removeItem("interval");
          localStorage.removeItem("numbers");
          localStorage.removeItem("winnerList");
          localStorage.removeItem("winnerNumbers");
          localStorage.removeItem("additionalWinnerNumbers");
          localStorage.removeItem("cardCheckToRender");

          localStorage.removeItem("gameStarted");
          localStorage.removeItem("gameScreenActive");
        }
        for (let y = 1; y <= 75; y++) {
          document.getElementById(y).style.color = "#3c3c3c";
        }

        document.getElementById("cardTocheck").value = "";
        setGameScreenActive(true);

        // if (betNumbers.length <= 5) {
        //   // non commusioned game
        //   document.getElementById("cardSelectionBox").style.display = "none";
        //   document.getElementById("containerBox").style.display = "grid";
        // } else if (betNumbers.length > 5) {
        // comussioned game
        //-----------------------------------------------------------------------------------------------------
        setLoading(true);
        try {
          // Ensure shared selection matches cashier before locking
          if (session?.user?.shopId) {
            await syncSetCards(betNumbers);
          }

          const response = await axios.post("/api/games", {
            cashierId: session.user.cashierId,
            betAmount: parseFloat(medebAmount),
            numberOfPlayers: parseInt(betNumbers.length),
            status: "active",
            comm: commusion,
          });

          if (
            response.status >= 200 &&
            response.status < 300 &&
            response.data?.gameId
          ) {
            const idd = response.data.gameId;
            setGameId(idd);

            if (session?.user?.shopId) {
              await lockSelection();
            }

            // Show game container & hide selection box
            document.getElementById("cardSelectionBox").style.display = "none";
            document.getElementById("containerBox").style.display = "grid";
          }
        } catch (error) {
          console.error("Game creation failed:", error.response?.data || error);

          // Show error message only, do not change game UI state
          toast(error.response?.data?.error || "Failed to start the game.");

          // Ensure game UI does not change when balance is low
          document.getElementById("cardSelectionBox").style.display = "grid";
          document.getElementById("containerBox").style.display = "none";
        } finally {
          setLoading(false);
        }

        //-------------------------------------------------------------------------------------------
      }
    } else {
      toast("Please Select at least 2 players");
    }
  };

  function resetSelected() {
    // reset the data
    setBetNumbers([]);

    if (session?.user?.shopId) {
      syncClearCards().catch((err) =>
        console.error("sync clear failed", err),
      );
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("betNumbers");
      localStorage.removeItem("medebAmount");
      localStorage.removeItem("interval");
      localStorage.removeItem("numbers");
      localStorage.removeItem("winnerList");
      localStorage.removeItem("winnerNumbers");
      localStorage.removeItem("additionalWinnerNumbers");
      localStorage.removeItem("cardCheckToRender");

      localStorage.removeItem("gameStarted");
      localStorage.removeItem("gameScreenActive");
    }
  }
  function restartGame() {
    // reset all the data
    hideOverlay2();
    // setBetNumbers([]);
    // maxGen = 75; // Number of random numbers to generate
    setIntervalValue(5);
    setNumbers([]);
    setWinnerList([]);
    setWinnerNumbers([]);
    setAdditionalWinnerNumbers([]);
    setLockedCards([]);
    setNarator("am");

    setIsGenerating(false);
    setIsPaused(true);
    setGameStarted(false);
    startShuffle(false);

    setCardCheckToRender(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem("medebAmount");
      localStorage.removeItem("interval");
      localStorage.removeItem("numbers");
      localStorage.removeItem("winnerList");
      localStorage.removeItem("winnerNumbers");
      localStorage.removeItem("additionalWinnerNumbers");
      localStorage.removeItem("cardCheckToRender");
      localStorage.removeItem("resumed");
      localStorage.removeItem("gameStarted");
      localStorage.removeItem("gameScreenActive");
    }
    for (let y = 1; y <= 75; y++) {
      document.getElementById(y).style.color = "#3c3c3c";
    }

    document.getElementById("cardTocheck").value = "";
    document.getElementById("cardSelectionBox").style.display = "grid";
    document.getElementById("containerBox").style.display = "none";

    // Unlock for new floor selection while keeping cards unless cleared
    if (session?.user?.shopId) {
      unlockSelection({ clear: false }).catch((err) =>
        console.error("unlock failed", err),
      );
    }
  }

  const handleCommusionChange = (event) => {
    setCommusion(event.target.value);
  };

  function shuffle() {
    startShuffle(true);

    //start shuffle sound
    if (soundStartRef.current.paused) {
      soundStartRef.current.src = shuffleAudio;
      soundStartRef.current.play();
    } else if (!soundStartRef.current.paused) {
      setTimeout(() => {
        if (soundStartRef.current.paused) {
          soundStartRef.current.src = shuffleAudio;
          soundStartRef.current.play();
        }
      }, 2000);
    }

    for (let x = 1; x < 76; x++) {
      let num = document.getElementById(x);

      let intv = setInterval(
        function () {
          num.style.color = num.style.color == "black" ? "white" : "black";
        },
        Math.floor(Math.random() * 1000),
      );

      setTimeout(() => {
        clearInterval(intv);
        num.style.color = "#3c3c3c";
        startShuffle(false);
      }, 5000);
    }
  }

  function getBallCollorMain() {
    if (numbers.length > 0) {
      let num = numbers[numbers.length - 1];
      if (num > 0 && num <= 15) return "b";
      else if (num > 15 && num <= 30) return "i";
      else if (num > 30 && num <= 45) return "n";
      else if (num > 45 && num <= 60) return "g";
      else if (num > 60 && num <= 75) return "o";
    }
  }
  function getBallCollor(index) {
    if (numbers.length > 0) {
      let num = numbers[numbers.length - index];
      if (num > 0 && num <= 15) return "b";
      else if (num > 15 && num <= 30) return "i";
      else if (num > 30 && num <= 45) return "n";
      else if (num > 45 && num <= 60) return "g";
      else if (num > 60 && num <= 75) return "o";
    }
  }

  function setMedb() {
    const x = document.getElementById("medeb").value;
    setMedebAmount(x);
  }

  function lockBoard() {
    const cardtolock = document.getElementById("cardTocheck").value;
    setLockedCards((prevNumbers) => [...prevNumbers, cardtolock]);
    toast("Card " + cardtolock + " locked");
    document.getElementById("haswonned").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }

  const handleLanguageChange = (event) => {
    setNarator(event.target.value);
  };
  // function ballDetailCheck(cardnum, ballnum) {
  //   // winner.map((detail) => {
  //   //   if (detail.id == cardnum) {

  //   //     detail.pattrenkeys.map((ball) => {

  //   //       return true;
  //   //     });

  //   //   }
  //   // });
  //   // return false;
  // }

  function showActiveBetters() {
    setTimeout(() => {
      setIsPaused(true);
    }, 3000);

    document.getElementById("cardSelectionBox").style.display = "grid";
    document.getElementById("containerBox").style.display = "none";
    document.getElementById("overlay3").style.display = "block";
  }
  function continueBtnOpr() {
    document.getElementById("cardSelectionBox").style.display = "none";
    document.getElementById("containerBox").style.display = "grid";
    document.getElementById("overlay3").style.display = "none";
  }

  function returnAudioObject(num) {
    if (num == 1) return b1Audio;
    else if (num == 2) return b2Audio;
    else if (num == 3) return b3Audio;
    else if (num == 4) return b4Audio;
    else if (num == 5) return b5Audio;
    else if (num == 6) return b6Audio;
    else if (num == 7) return b7Audio;
    else if (num == 8) return b8Audio;
    else if (num == 9) return b9Audio;
    else if (num == 10) return b10Audio;
    else if (num == 11) return b11Audio;
    else if (num == 12) return b12Audio;
    else if (num == 13) return b13Audio;
    else if (num == 14) return b14Audio;
    else if (num == 15) return b15Audio;
    else if (num == 16) return i16Audio;
    else if (num == 17) return i17Audio;
    else if (num == 18) return i18Audio;
    else if (num == 19) return i19Audio;
    else if (num == 20) return i20Audio;
    else if (num == 21) return i21Audio;
    else if (num == 22) return i22Audio;
    else if (num == 23) return i23Audio;
    else if (num == 24) return i24Audio;
    else if (num == 25) return i25Audio;
    else if (num == 26) return i26Audio;
    else if (num == 27) return i27Audio;
    else if (num == 28) return i28Audio;
    else if (num == 29) return i29Audio;
    else if (num == 30) return i30Audio;
    else if (num == 31) return n31Audio;
    else if (num == 32) return n32Audio;
    else if (num == 33) return n33Audio;
    else if (num == 34) return n34Audio;
    else if (num == 35) return n35Audio;
    else if (num == 36) return n36Audio;
    else if (num == 37) return n37Audio;
    else if (num == 38) return n38Audio;
    else if (num == 39) return n39Audio;
    else if (num == 40) return n40Audio;
    else if (num == 41) return n41Audio;
    else if (num == 42) return n42Audio;
    else if (num == 43) return n43Audio;
    else if (num == 44) return n44Audio;
    else if (num == 45) return n45Audio;
    else if (num == 46) return g46Audio;
    else if (num == 47) return g47Audio;
    else if (num == 48) return g48Audio;
    else if (num == 49) return g49Audio;
    else if (num == 50) return g50Audio;
    else if (num == 51) return g51Audio;
    else if (num == 52) return g52Audio;
    else if (num == 53) return g53Audio;
    else if (num == 54) return g54Audio;
    else if (num == 55) return g55Audio;
    else if (num == 56) return g56Audio;
    else if (num == 57) return g57Audio;
    else if (num == 58) return g58Audio;
    else if (num == 59) return g59Audio;
    else if (num == 60) return g60Audio;
    else if (num == 61) return o61Audio;
    else if (num == 62) return o62Audio;
    else if (num == 63) return o63Audio;
    else if (num == 64) return o64Audio;
    else if (num == 65) return o65Audio;
    else if (num == 66) return o66Audio;
    else if (num == 67) return o67Audio;
    else if (num == 68) return o68Audio;
    else if (num == 69) return o69Audio;
    else if (num == 70) return o70Audio;
    else if (num == 71) return o71Audio;
    else if (num == 72) return o72Audio;
    else if (num == 73) return o73Audio;
    else if (num == 74) return o74Audio;
    else if (num == 75) return o75Audio;
  }

  return (
    <>
      {/* /// card Selector area */}

      <div id="cardSelectionBox" className="cardSelectionArea">
        <div className="betAmount">
          <div className="amountSec">
            <label className="amoutSecLabel"> Bet Amount </label>
            <div className="amoutSecInput">
              <input
                id="medeb"
                type="number"
                placeholder="0 Birr"
                className="betAmountInput"
                onChange={setMedb}
                min="10"
                step="10"
                value={medebAmount}
              />
            </div>
          </div>
        </div>
        <div className="betNumber">
          <div className="betSec">
            <label className="betSecLabel"> Total Players </label>
            <div className="betSecNumber">
              <label> {betNumbers.length} </label>
            </div>
          </div>
        </div>
        <div className="betNumber">
          <div className="betSec">
            <label className="betSecLabel"> Winner Amount </label>
            <div className="betSecNumber">
              <label>
                {" "}
                {betNumbers.length >= commusion
                  ? betNumbers.length * medebAmount * (1 - shopCommissionRate)
                  : betNumbers.length * medebAmount}
                {" Birr "}{" "}
              </label>
            </div>
          </div>
        </div>
        <div className="walletStatus">
          <div className="walSec">
            <label className="walSecLabel"> Wallet Amount </label>
            <div
              className={
                walletBalance?.toFixed(2) > 1000
                  ? walletBalance?.toFixed(2) > 1000 &&
                    walletBalance?.toFixed(2) < 2000
                    ? "walSecValueWarn"
                    : "walSecValue"
                  : "walSecValueLow"
              }
            >
              <label>
                {walletBalance?.toFixed(2) > 1000
                  ? walletBalance?.toFixed(2) > 1000 &&
                    walletBalance?.toFixed(2) < 2000
                    ? "Warning"
                    : "Excellent"
                  : "Low"}
              </label>
            </div>
          </div>
        </div>
        <div className="cardSelector">
          <div className="cardSelectSec">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                padding: "0 4px",
                color: "#495057",
                fontSize: 14,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <span>
                Cards 1–{TOTAL_CARDS} (scroll for more)
              </span>
              <span>
                Selected: {betNumbers.length}
              </span>
            </div>
            <div
              className="cardGrid"
              style={{
                overflowY: "auto",
                flex: 1,
                minHeight: 0,
              }}
            >
              {Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setBetCard(n)}
                  className={
                    !betNumbers.includes(n) ? "cardToselect" : "cardselected"
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="gameOprSec">
              <button
                id="startGameBtn"
                onClick={startGame}
                className="StartGame"
                disabled={loading}
              >
                {loading ? "Loading..." : "New Game"}
              </button>
              <button
                id="resetSelectedBtn"
                onClick={resetSelected}
                className="clear"
              >
                Clear
              </button>

              <label className="controlLable"> Commusion: </label>
              <select
                className="controlSelect"
                onChange={handleCommusionChange}
              >
                <option value={6}> Six Players</option>
                <option value={3}> Three Players</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* //// End of card Selector area */}

      <div id="overlay3" className="overlay3">
        {/* for the restart better review their cards */}

        <div className="overlayControls3">
          <button onClick={continueBtnOpr} className="continueGameBtn">
            Continue To Game
          </button>
        </div>
      </div>

      <div id="overlay4" className="overlay4">
        {/* for the loader */}

        <div className="spinner">
          <h2> Loading.... Please wait</h2>
          <div className="spinner-circle"></div>
        </div>
      </div>

      {/* 
    //// player area  */}

      <div id="containerBox" className="container">
        <div className="sidebar">
          <div className="calls">
            <div className="total">
              <label className="totalValue"> {numbers.length} </label>
            </div>

            <div className="prev">
              <label className="prevValue">
                {" "}
                {numbers[numbers.length - 2]
                  ? numbers[numbers.length - 2]
                  : "0"}{" "}
              </label>
            </div>
            <div className="totalLable">TOTAL CALLS</div>
            <div className="prevLable"> PREVIOUS CALL</div>
          </div>

          <div className="logo">
            <h2 className="yamilable">
              Y <span>A</span> M <span> I</span>{" "}
            </h2>
            <h2 className="bingoLable">
              {" "}
              B <span>I</span> N <span>G</span> O
            </h2>
          </div>

          <div className="pattern">
            <Image alt="ATS" className="patternTemp" src={images} />
          </div>
        </div>

        <div className="gameArea">
          <div className="playingArea">
            <div className="bingoLetters">
              <div className="letter2">B</div>
              <div className="letter">I</div>
              <div className="letter">N</div>
              <div className="letter">G</div>
              <div className="letter">O</div>
            </div>
            <div className="bingoNumbers">
              <div className="numbers1">
                <div id="1" className="numberr">
                  1
                </div>
                <div id="2" className="numberr">
                  2
                </div>
                <div id="3" className="numberr">
                  3
                </div>
                <div id="4" className="numberr">
                  4
                </div>
                <div id="5" className="numberr">
                  5
                </div>
                <div id="6" className="numberr">
                  6
                </div>
                <div id="7" className="numberr">
                  7
                </div>
                <div id="8" className="numberr">
                  8
                </div>
                <div id="9" className="numberr">
                  9
                </div>
                <div id="10" className="number">
                  10
                </div>
                <div id="11" className="number">
                  11
                </div>
                <div id="12" className="number">
                  12
                </div>
                <div id="13" className="number">
                  13
                </div>
                <div id="14" className="number">
                  14
                </div>
                <div id="15" className="number">
                  15
                </div>
              </div>
              <div className="numbers2">
                <div id="16" className="number">
                  16
                </div>
                <div id="17" className="number">
                  17
                </div>
                <div id="18" className="number">
                  18
                </div>
                <div id="19" className="number">
                  19
                </div>
                <div id="20" className="number">
                  20
                </div>
                <div id="21" className="number">
                  21
                </div>
                <div id="22" className="number">
                  22
                </div>
                <div id="23" className="number">
                  23
                </div>
                <div id="24" className="number">
                  24
                </div>
                <div id="25" className="number">
                  25
                </div>
                <div id="26" className="number">
                  26
                </div>
                <div id="27" className="number">
                  27
                </div>
                <div id="28" className="number">
                  28
                </div>
                <div id="29" className="number">
                  29
                </div>
                <div id="30" className="number">
                  30
                </div>
              </div>
              <div className="numbers3">
                <div id="31" className="number">
                  31
                </div>
                <div id="32" className="number">
                  32
                </div>
                <div id="33" className="number">
                  33
                </div>
                <div id="34" className="number">
                  34
                </div>
                <div id="35" className="number">
                  35
                </div>
                <div id="36" className="number">
                  36
                </div>
                <div id="37" className="number">
                  37
                </div>
                <div id="38" className="number">
                  38
                </div>
                <div id="39" className="number">
                  39
                </div>
                <div id="40" className="number">
                  40
                </div>
                <div id="41" className="number">
                  41
                </div>
                <div id="42" className="number">
                  42
                </div>
                <div id="43" className="number">
                  43
                </div>
                <div id="44" className="number">
                  44
                </div>
                <div id="45" className="number">
                  45
                </div>
              </div>
              <div className="numbers4">
                <div id="46" className="number">
                  46
                </div>
                <div id="47" className="number">
                  47
                </div>
                <div id="48" className="number">
                  48
                </div>
                <div id="49" className="number">
                  49
                </div>
                <div id="50" className="number">
                  50
                </div>
                <div id="51" className="number">
                  51
                </div>
                <div id="52" className="number">
                  52
                </div>
                <div id="53" className="number">
                  53
                </div>
                <div id="54" className="number">
                  54
                </div>
                <div id="55" className="number">
                  55
                </div>
                <div id="56" className="number">
                  56
                </div>
                <div id="57" className="number">
                  57
                </div>
                <div id="58" className="number">
                  58
                </div>
                <div id="59" className="number">
                  59
                </div>
                <div id="60" className="number">
                  60
                </div>
              </div>
              <div className="numbers5">
                <div id="61" className="number">
                  61
                </div>
                <div id="62" className="number">
                  62
                </div>
                <div id="63" className="number">
                  63
                </div>
                <div id="64" className="number">
                  64
                </div>
                <div id="65" className="number">
                  65
                </div>
                <div id="66" className="number">
                  66
                </div>
                <div id="67" className="number">
                  67
                </div>
                <div id="68" className="number">
                  68
                </div>
                <div id="69" className="number">
                  69
                </div>
                <div id="70" className="number">
                  70
                </div>
                <div id="71" className="number">
                  71
                </div>
                <div id="72" className="number">
                  72
                </div>
                <div id="73" className="number">
                  73
                </div>
                <div id="74" className="number">
                  74
                </div>
                <div id="75" className="number">
                  75
                </div>
              </div>
            </div>

            <div className="bingoLetters2">
              <div className="letter2">B</div>
              <div className="letter">I</div>
              <div className="letter">N</div>
              <div className="letter">G</div>
              <div className="letter">O</div>
            </div>
          </div>
        </div>
        <div className="controller">
          <div id="overlay" className="overlay">
            <h3 className="cartelaNum">
              {" "}
              Cartela - {cardCheckToRender} {"->"} {numbers.length} Call
              <span id="haswonned" className="haswon">
                {" "}
                WINNER!!
              </span>
            </h3>
            <div className="winnerCheckGrid">
              {dbCards.map((card) => {
                if (card.id == cardCheckToRender) {
                  return card.value.map((ball) => (
                    <div
                      className={
                        !lockedCards.includes(ball)
                          ? numbers[numbers.length - 1] != ball
                            ? ball != 0
                              ? numbers.includes(ball)
                                ? winnerNumbers.includes(ball) ||
                                  additionalWinnerNumbers.includes(ball)
                                  ? "cardDetailWinner"
                                  : "cardDetail"
                                : "cardDetailUnselected"
                              : "cardDetailWinner"
                            : "cardDetailActive"
                          : "cardDetailLocked"
                      }
                      key={ball}
                    >
                      {ball == 0 ? "Free" : ball}
                    </div>
                  ));
                }
              })}
            </div>

            <div className="overlayControls">
              <button onClick={lockBoard} className="lockBoardLockBtn">
                Lock Board
              </button>
              <button onClick={hideOverlay} className="lockBoardCancleBtn">
                Cancel{" "}
              </button>
            </div>
          </div>

          <div className="separator"></div>

          <div id="overlay2" className="overlay2">
            {/* for the restart confirmation */}

            <h2>Are you sure you want to reset the game?</h2>

            <div className="overlayControls2">
              <button onClick={restartGame} className="confirmResetButton">
                Continue
              </button>
              <button onClick={hideOverlay2} className="cancelResetButton">
                Cancel{" "}
              </button>
            </div>
          </div>

          <div className="controllerSection">
            <div className="contSec1">
              <div
                className={
                  getBallCollorMain() == "b"
                    ? "bingo-ball-container5"
                    : getBallCollorMain() == "i"
                      ? "bingo-ball-container2"
                      : getBallCollorMain() == "n"
                        ? "bingo-ball-container6"
                        : getBallCollorMain() == "g"
                          ? "bingo-ball-container7"
                          : getBallCollorMain() == "o"
                            ? "bingo-ball-container8"
                            : "bingo-ball-container9"
                }
              >
                <div className="bingo-ball">
                  <div className="circle-border"></div>
                  <div className="circle-number">
                    {numbers[numbers.length - 1]
                      ? getLetter(numbers[numbers.length - 1])
                      : "-"}{" "}
                  </div>
                </div>
              </div>
              <div className="miniBallContainer">
                <div id="miniBall1" disabled={true} className="miniBall1">
                  <div
                    className={
                      getBallCollor(1) == "b"
                        ? "bingo-ball-container5"
                        : getBallCollor(1) == "i"
                          ? "bingo-ball-container2"
                          : getBallCollor(1) == "n"
                            ? "bingo-ball-container6"
                            : getBallCollor(1) == "g"
                              ? "bingo-ball-container7"
                              : getBallCollor(1) == "o"
                                ? "bingo-ball-container8"
                                : "bingo-ball-container9"
                    }
                  >
                    <div className="bingo-ball">
                      <div className="circle-number">
                        {" "}
                        {numbers[numbers.length - 1]
                          ? numbers[numbers.length - 1]
                          : "-"}{" "}
                      </div>
                    </div>
                  </div>
                </div>
                <div id="miniBall2" className="miniBall2">
                  <div
                    className={
                      getBallCollor(2) == "b"
                        ? "bingo-ball-container5"
                        : getBallCollor(2) == "i"
                          ? "bingo-ball-container2"
                          : getBallCollor(2) == "n"
                            ? "bingo-ball-container6"
                            : getBallCollor(2) == "g"
                              ? "bingo-ball-container7"
                              : getBallCollor(2) == "o"
                                ? "bingo-ball-container8"
                                : "bingo-ball-container9"
                    }
                  >
                    <div className="bingo-ball">
                      <div className="circle-number">
                        {" "}
                        {numbers[numbers.length - 2]
                          ? numbers[numbers.length - 2]
                          : "-"}{" "}
                      </div>
                    </div>
                  </div>
                </div>
                <div id="miniBall3" className="miniBall3">
                  <div
                    className={
                      getBallCollor(3) == "b"
                        ? "bingo-ball-container5"
                        : getBallCollor(3) == "i"
                          ? "bingo-ball-container2"
                          : getBallCollor(3) == "n"
                            ? "bingo-ball-container6"
                            : getBallCollor(3) == "g"
                              ? "bingo-ball-container7"
                              : getBallCollor(3) == "o"
                                ? "bingo-ball-container8"
                                : "bingo-ball-container9"
                    }
                  >
                    <div className="bingo-ball">
                      <div className="circle-number">
                        {" "}
                        {numbers[numbers.length - 3]
                          ? numbers[numbers.length - 3]
                          : "-"}{" "}
                      </div>
                    </div>
                  </div>
                </div>
                <div id="miniBall4" className="miniBall4">
                  <div
                    className={
                      getBallCollor(4) == "b"
                        ? "bingo-ball-container5"
                        : getBallCollor(4) == "i"
                          ? "bingo-ball-container2"
                          : getBallCollor(4) == "n"
                            ? "bingo-ball-container6"
                            : getBallCollor(4) == "g"
                              ? "bingo-ball-container7"
                              : getBallCollor(4) == "o"
                                ? "bingo-ball-container8"
                                : "bingo-ball-container9"
                    }
                  >
                    <div className="bingo-ball">
                      <div className="circle-number">
                        {" "}
                        {numbers[numbers.length - 4]
                          ? numbers[numbers.length - 4]
                          : "-"}{" "}
                      </div>
                    </div>
                  </div>
                </div>
                <div id="miniBall5" className="miniBall5">
                  <div
                    className={
                      getBallCollor(5) == "b"
                        ? "bingo-ball-container5"
                        : getBallCollor(5) == "i"
                          ? "bingo-ball-container2"
                          : getBallCollor(5) == "n"
                            ? "bingo-ball-container6"
                            : getBallCollor(5) == "g"
                              ? "bingo-ball-container7"
                              : getBallCollor(5) == "o"
                                ? "bingo-ball-container8"
                                : "bingo-ball-container9"
                    }
                  >
                    <div className="bingo-ball">
                      <div className="circle-number">
                        {" "}
                        {numbers[numbers.length - 5]
                          ? numbers[numbers.length - 5]
                          : "-"}{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="contSec2">
              <div className="controlBtnSec2">
                <button
                  id="generateButton"
                  disabled={(isGenerating && !isPaused) || shuffling || loading}
                  onClick={handleGenerate}
                  className="controlBtn3"
                >
                  {" "}
                  {loading ? "Loading..." : "Start Autoplay"}
                </button>
              </div>
              <div className="controlBtnSec">
                <button
                  id="playButton"
                  onClick={handlePause}
                  disabled={!isGenerating || isPaused}
                  className="controlBtn4"
                >
                  {" "}
                  Pause AutoPlay
                </button>
              </div>
              <div className="controlBtnSec2">
                <button
                  onClick={dispOverlay2}
                  disabled={(isGenerating && !isPaused) || shuffling}
                  className="controlBtn"
                >
                  {" "}
                  Reset Board{" "}
                </button>
              </div>
              <div className="controlBtnSec2">
                <button
                  onClick={shuffle}
                  disabled={gameStarted}
                  className="controlBtn"
                >
                  {" "}
                  Shuffle Board{" "}
                </button>
              </div>
            </div>

            <div className="contSec3">
              <div className="controlBtnSec3">
                <input
                  onChange={handleRangeChange}
                  className="controlRng"
                  type="range"
                  id="points"
                  name="points"
                  min="2"
                  max="10"
                />
              </div>
              <div className="controlBtnSec3">
                <label className="controlLable"> Caller Selection: </label>

                <select
                  className="controlSelect"
                  name="cars"
                  id="narator"
                  onChange={handleLanguageChange}
                >
                  {/* Your fixed preferred options at the top */}
                  <option value="am">Yami Amharic voice</option>

                  {/* Dynamically render all available voices below */}
                  {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="controlBtnSec3">
                <label className="controlLable"> Check Board: </label>
                <input
                  className="inputCardNumber"
                  id="cardTocheck"
                  placeholder="0"
                  type="number"
                  min="1"
                  max="200"
                  onChange={checkBoardOnChange}
                />
                <div>
                  <button onClick={dispOverlay} className="controlBtn2">
                    {" "}
                    Check Board
                  </button>
                </div>
              </div>
            </div>

            <div className="contSec4">
              <div onClick={showActiveBetters} className="bingo-ball-container">
                <div className="bingo-ball">
                  <div className="circle-border"></div>
                  <div className="circle-number">
                    <div className="newLable">Amount</div>
                    {betNumbers.length >= commusion
                      ? betNumbers.length *
                        medebAmount *
                        (1 - shopCommissionRate)
                      : betNumbers.length * medebAmount}
                    <div className="newLable2">Birr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bingo;

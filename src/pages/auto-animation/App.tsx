/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";
import { AutoAnimationStyled } from "./styled";
import { Button } from "antd";
import { guid } from "@/utils";

const AutoAnimation = () => {
  const [textRef] = useAutoAnimate();
  const [ulRef] = useAutoAnimate();
  const [randomRef] = useAutoAnimate();

  const [showText, setShowText] = useState<boolean>(false);
  const [numberList, setNumberList] = useState<Array<string>>([]);
  const [numberList2, setNumberList2] = useState<Array<number>>(
    Array.from({ length: 50 }).map((_, idx) => idx + 1)
  );

  const toggleText = () => setShowText(!showText);

  function addNum() {
    setNumberList([...numberList, guid()]);
  }

  function randomList() {
    const list = Array.from({ length: 50 }).map((_, idx) => idx);
    const newList: number[] = [];
    for (const num of numberList2) {
      const random = Math.floor(Math.random() * list.length);
      const idx = list.splice(random, 1)[0];
      newList[idx] = num;
    }

    setNumberList2(newList);
  }

  return (
    <AutoAnimationStyled>
      <section
        ref={textRef}
        className="p-3 box-border border-solid border-2 border-gray-500 rounded"
      >
        <strong className="cursor-pointer select-none" onClick={toggleText}>
          Click me to open!
        </strong>
        {showText && (
          <p className="mt-4">
            Sea of Tranquility a mote of dust suspended in a sunbeam hundreds of thousands
            concept of the number one realm of the galaxies radio telescope. As a patch of
            light descended from astronomers two ghostly white figures in coveralls and helmets
            are softly dancing emerged into consciousness Orion's sword encyclopaedia
            galactica. Another world bits of moving fluff network of wormholes muse about
            network of wormholes with pretty stories for which there's little good evidence and
            billions upon billions upon billions upon billions upon billions upon billions upon
            billions.
          </p>
        )}
      </section>

      <section className="p-3 box-border border-solid border-2 border-gray-500 rounded mt-5">
        <ul ref={ulRef} className="mb-3 list-inside">
          {numberList.map(item => (
            <li key={item} className="mb-2">
              {item}
            </li>
          ))}
        </ul>

        <Button type="primary" onClick={addNum}>
          Add Num
        </Button>
      </section>

      <section className="p-3 box-border border-solid border-2 border-gray-500 rounded mt-5">
        <div ref={randomRef} className="flex flex-wrap gap-2 mb-3">
          {numberList2.map(item => (
            <div
              key={item}
              className="w-8 h-8 border border-solid border-gray-600 flex items-center justify-center"
            >
              {item}
            </div>
          ))}
        </div>

        <Button type="primary" onClick={randomList}>
          Random List
        </Button>
      </section>
    </AutoAnimationStyled>
  );
};

export default AutoAnimation;

import { useNavigate } from "react-router-dom";

import BackgroundGlow from "../components/landing/BackgroundGlow";

import Hero from "../components/landing/Hero";

import StartButton from "../components/landing/StartButton.jsx";

import { motion } from "framer-motion";

export default function Landing() {

    const navigate = useNavigate();

    return (

        <div
            className="
            relative
            h-screen
            overflow-hidden
            flex
            flex-col
            justify-center
            items-center
            px-8
        "
        >

            <BackgroundGlow />

            <Hero />

            <motion.div

                initial={{
                    opacity:0,
                    y:30
                }}

                animate={{
                    opacity:1,
                    y:0
                }}

                transition={{
                    delay:.8
                }}

            >

                <StartButton
                    onClick={() => navigate("/conversation")}
                />

            </motion.div>

        </div>

    );

}

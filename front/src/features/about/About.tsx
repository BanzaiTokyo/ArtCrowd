import React from "react";
import {SITE_NAME} from "../../Constants";

function About() {

    return (
        <main>
            <h1>About {SITE_NAME}</h1>
            <p>This is a kind of kickstarter to support art projects. Once the project is completed, you will receive an
                NFT on Tezos blockchain to commemorate your contribution.</p>

            <p>The work is in progress and we add new things every day bit by bit. I would very much appreciate your
                input. Feel free to share your ideas for new features, point our errors or just say hi on
                Twitter/X: <a href="https://twitter.com/BanzaiTokyo">@BanzaiTokyo</a>

            </p>
        </main>
    );


}

export default About;
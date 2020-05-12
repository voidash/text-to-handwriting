Vue.component("generator-form", {
    template: "#formPart",
    data() {
        return {
            content: "",
            kermetFactor: 20,
            textflyFactor: 0,
            fontSize: 40,
            allowSynonyms: "no",
            showIndent: "white",
        }
    },
    methods: {
        generate() {
            const resource = {
                content: this.content,
                kermetFactor: this.kermetFactor,
                textflyFactor: this.textflyFactor,
                fontSize: this.fontSize,
                allowSynonyms: this.allowSynonyms,
                showIndent: this.showIndent
            }
            this.$emit("submitted-elements", resource);
        }

    }
});



new Vue({
    el: "#app",
    data() {
        return {
            resource: "",
            renderables: "",
            removeForm: false
        }
    },
    methods: {
        prepareContent(e) {
            this.resource = e;
            let skipPosition = this.regexMatch();
            let renderables = this.splitStrings(skipPosition);
            this.kermet(this.resource.allowSynonyms, skipPosition);
            this.renderables = renderables.join("");
        },

        regexMatch() {
            let matchType = {
                figureBox: /##\[([a-z]+)\s([0-9]+)\s([0-9]+)\]##/gm,
            }
            let skipPosition = [];
            let a = 0, b = 0;
            for (var regex in matchType) {
                let matchIterator = this.resource.content.matchAll(matchType[regex]);

                let done = false;
                while (!done) {
                    match = matchIterator.next();
                    if (match.done) {
                        done = true;
                        break;
                    }
                    let pos = match.value.index - a + b;

                    switch (match.value[1]) {
                        case "figure":
                            //replace matched part with actual div element
                            divElem = `<div style="position:relative;display:block;background-color:${this.resource.showIndent};width:${match.value[2]}cm;height:${match.value[3]}cm"></div>`;
                            this.resource.content = this.resource.content.replace(match.value[0], divElem);
                            skipPosition.push([pos, pos + divElem.length]);
                            a += match.value[0].length;
                            b += divElem.length;

                            break;
                    }

                }
            }

            return skipPosition;
        },
        generateRand() {
            return Math.floor(Math.random() * 3 + 1);
        },

        kermet(useSynonym, skipPosition) {
            console.log(skipPosition);
            //first make the strings splittable by omitting renderable content
            let substringable = []

            let bufferPos = 0;
            if (skipPosition !== []) {
                skipPosition.forEach((pos) => {
                    //console.log(pos);
                    substringable.push([bufferPos, pos[0]]);
                    bufferPos = pos[1];
                });
                substringable.push([bufferPos, this.resource.content.length]);
            } else {
                substringable.push([0, this.resource.content.length]);
            }
            console.log(substringable);
            let DOMOmittedText = "";
            substringable.forEach((pos) => DOMOmittedText += this.resource.content.substring(pos[0], pos[1]));

            console.log(DOMOmittedText);
            //randomly select one word

            if (useSynonym === "yes") {
                //uses words api and and finds synonyms 
                console.log("You selected yes ");
            } else {

            }

        },
        splitStrings(skipPosition, kermetResource) {
            //splits the strings. can't use str.split(" ") function because , there is presence of html elements ready to be rendered.
            //needs a counter to skip certain positions.

            let renderableElements = [];

            let bufferString = this.resource.content;
            let counter = 0;


            let flag;

            if (skipPosition.length === 0) {
                flag = true;
            } else {
                flag = false;
            }

            for (let i = 0; i < bufferString.length; i++) {

                if (flag == false) {
                    if (skipPosition[counter][0] == i) {
                        renderableElements.push(bufferString.substring(skipPosition[counter][0], skipPosition[counter][1]));
                        i = skipPosition[counter][1];
                        counter++;
                        if (counter == skipPosition.length) {
                            flag = true;
                        }
                    }
                }

                //for counting enter and addding a paragraph break if found so.
                if (bufferString[i] == '\n') {
                    renderableElements.push(`<p></p>`);
                   
                } 

                //kermet controls indentation errors and no of text to cut

                //for bad indentation
                if (i % (280 - (this.resource.kermetFactor * 2) - 20) == 0) {
                    renderableElements.push([`<div style="position: relative;float:left;width:20px;height:${this.resource.fontSize}px;background-color:${this.resource.showIndent}"></div>`]);
                    spanData=`<span style="font-family:ash${this.generateRand()};font-size:${this.resource.fontSize}px;position:relative;'">${bufferString[i]}</span>`;
                } else {
                    spanData=`<span style="font-family:ash${this.generateRand()};font-size:${this.resource.fontSize}px;">${bufferString[i]}</span>`;
                }

                //use different font for punctuation
                switch(bufferString[i]){
                    case "{":
                    case "}":
                    case "(":
                    case ")":
                    case "<":
                    case ">":
                    case "#":
                    case "=":
                    case "]":
                    case "[":
                    case "*":
                    case ":":
                    case "\"":
                    case "'":
                    case "|":
                    case "/":
                    case "&":
                    case "’":
                    case "”":
                    case "“":
                    case ",":
                    case ".":
                    case "-":
                    case "$":
                    case "^":
                    case"\`":
                    case"~":
                        spanData = spanData.replace(/ash[0-9]/gm,"punctuationAshish");
                }
                renderableElements.push(spanData);
                //this.resource.content = this.resource.content.replace(bufferString[i],``)
            }

            return renderableElements;
        }

    }
});
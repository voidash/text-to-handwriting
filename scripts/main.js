Vue.component("generator-form", {
    template: "#formPart",
    data() {
        return {
            content: "",
            kermetFactor: 20,
            fontSize: 40,
            allowStrikeThrough: "no",
            showIndent: "white",
            splitMethod: "alphabet",
            textFlyFactor: 0,
            totalWordsToStrikeThrough: 0
        }
    },
    methods: {
        generate() {
            const resource = {
                content: this.content,
                kermetFactor: this.kermetFactor,
                fontSize: this.fontSize,
                allowStrikeThrough: this.allowStrikeThrough,
                showIndent: this.showIndent,
                splitMethod: this.splitMethod,
                textFlyFactor: this.textFlyFactor,
                totalWordsToStrikeThrough: this.totalWordsToStrikeThrough
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
            removeForm: false,
            cap: 30,
            prevElement: 0
        }
    },
    methods: {
        prepareContent(e) {
            this.resource = e;
            this.prevElement = 0;
            this.cap = 30;
            let skipPosition = this.regexMatch();
            let renderables = this.splitStrings(skipPosition);
            this.renderables = renderables.join("");
        },

        regexMatch() {
            let matchType = {
                figureBox: /##\[(figure)\s([0-9]+)\s([0-9]+)\]##/gm,
                strikeThrough: /##\[(strike)\s(.+)\]##/gm,
                title: /##\[(title)\s([0-9]+)\s(.+)\s?\]##/gm,
            }
            let skipPosition = [];

            /* 
                        let done = false;
                        while (!done) {
                            let matchCount = 0;
                            for (counter in matchType) {
                                let match = matchType[counter].exec(this.resource.content);
                                if(match==null){
                                    matchCount++;
                                    continue;
                                }
                                switch(match[1]){
                                    case "figure":
            
                                }
            
                            }
                            if(matchCount==Object.keys(matchType).length){
                                done = true;
                            }
                        } */

            for (var counter in matchType) {
                
                let matchIterator = this.resource.content.matchAll(matchType[counter]);
                console.log(this.resource.content);
                let done = false;
                while (!done) {
                    match = matchIterator.next();
                    if (match.done) {
                        done = true;
                        break;
                    }

                    let divElem;

                    switch (match.value[1]) {
                        case "figure":
                            //replace matched part with actual div element
                            divElem = `<span style="position:relative;display:block;background-color:${this.resource.showIndent};width:${match.value[2]}cm;height:${match.value[3]}cm"></span>`;
                            this.resource.content = this.resource.content.replace(match.value[0], divElem);
                            break;
                        case "strike":
                            divElem = `<span style="font-family:ash2;font-size:${this.resource.fontSize}px;text-decoration:line-through;">${match.value[2]}</span>`
                            this.resource.content = this.resource.content.replace(match.value[0], divElem);
                            break;
                        case "title":
                            console.log(match.value);
                            divElem = `<span style="font-family:ash2;font-size:${match.value[2]}px;">${match.value[3]}</span>`;
                            this.resource.content = this.resource.content.replace(match.value[0], divElem);
                            break;
                    }

                }
            }
            spanRegStringIterator = this.resource.content.matchAll(/<span.*>.*<\/span>/gm);
            let spanSelector;
            while((spanSelector=spanRegStringIterator.next()).done != true){
                skipPosition.push([spanSelector.value.index,spanSelector.value.index+spanSelector.value[0].length]);
            }
          
            return skipPosition;
        },
        generateRand() {
            return Math.floor(Math.random() * 3 + 1);
        },


        splitStrings(skipPosition) {

            skipPosition = skipPosition.sort((a, b) => {
                if (a[0] == b[0]) {
                    return 0;
                } else {
                    return (a[0] < b[0]) ? -1 : 1;
                }
            });

            console.log(skipPosition);
            let renderableElements = [];


            let bufferString = this.resource.content;
            let spanData;
            if (this.resource.splitMethod == "word") {
                //first make the strings splittable by omitting renderable content
                let substringable = []

                let bufferPos = 0;
                if (skipPosition !== []) {
                    skipPosition.forEach((pos) => {

                        substringable.push([bufferPos, pos[0]]);
                        substringable.push(bufferString.substring(pos[0], pos[1]));

                        bufferPos = pos[1];
                    });
                    substringable.push([bufferPos, this.resource.content.length]);
                } else {
                    substringable.push([0, this.resource.content.length]);
                }



                let wordCount = this.resource.totalWordsToStrikeThrough;

                substringable.forEach((pos) => {
                    let DOMOmittedTextSpan = [];
                    if (typeof pos == "object") {
                        DOMOmittedTextSpan = this.resource.content.substring(pos[0], pos[1]).split(" ");
                        randomNum = new Set();

                        for (let j = 0; j <= wordCount; j++) {
                            randomNum.add(Math.floor(Math.random() * DOMOmittedTextSpan.length));
                        }

                        //selects span


                        for (let i in DOMOmittedTextSpan) {
                            let span = DOMOmittedTextSpan[i];
                            let [x, y] = this.spanGeneration(i * 7, span);
                            if (this.resource.allowStrikeThrough == "yes") {
                                if (randomNum.has(parseInt(i)) === true) {

                                    x = x.replace(/font-family:ash[0-9];font-size:[0-9]{1,}px;/gm, `font-family:ash3;text-decoration:line-through;font-size:${this.resource.fontSize}px;`);
                                }
                            }

                            renderableElements.push(x);
                            renderableElements.push(`<span style="font-family:ash2;font-size:${this.resource.fontSize}px;"> </span>`);
                            if (y) {
                                renderableElements.push(y);
                            }
                        }
                    } else {
                        renderableElements.push(pos);
                    }

                });



            } else if (this.resource.splitMethod == "alphabet") {

                //splits the strings. can't use str.split(" ") function because , there is presence of html elements ready to be rendered.
                //needs a counter to skip certain positions.
                //fonts change on words or alphabet

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

                    let divElem;
                    if (bufferString[i]) {
                        [spanData, divElem] = this.spanGeneration(i, bufferString[i]);
                        renderableElements.push(spanData);
                        if (divElem) {
                            renderableElements.push(divElem);
                        }
                    }
                    //this.resource.content = this.resource.content.replace(bufferString[i],``)
                }


            }

            return renderableElements;
        },
        spanGeneration(pos, str) {


            //checking for punctuations and replacing it with different font
            for (let i = 0; i < str.length; i++) {

                let strAlphabet = str[i];
                switch (strAlphabet) {
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
                    case '"':
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
                    case "\`":
                    case "~":
                        let punctuationSpan = `<span style="font-family:punctuationAshish;font-size:${this.resource.fontSize}px;position:relative;">${strAlphabet}</span>`;
                        str = str.substring(0, i) + punctuationSpan + str.substring(i + 1, str.length);
                        i += punctuationSpan.length - 1;
                        break;

                    case '\n':
                        let enter = `<p></p>`;
                        str = str.substring(0, i) + enter + str.substring(i + 1, str.length);
                        i += enter.length - 1;
                        break;
                }
            }

            let spanData = [];
            if (pos % (280 - (this.resource.kermetFactor * 2) - 20) == 0) {
                spanData.push(`<span style="font-family:ash${this.generateRand()};font-size:${this.resource.fontSize}px;position:relative;top:${this.randomTextFly(Math.floor(Math.random() * this.resource.textFlyFactor))}px;">${str}</span>`);
                spanData.push(`<div style="position: relative;float:left;width:20px;height:${this.resource.fontSize}px;background-color:${this.resource.showIndent}"></div>`);

            } else {
                spanData.push(`<span style="font-family:ash${this.generateRand()};font-size:${this.resource.fontSize}px;position:relative;top:${this.randomTextFly(Math.floor(Math.random() * this.resource.textFlyFactor))}px;">${str}</span>`);
            }
            return spanData;
        },
        randomTextFly(maxData) {

            if (this.prevElement == 0) {
                this.cap = 30;
            } else if (this.prevElement == 30) {
                this.cap = 0;
            }
            if (maxData > this.prevElement && this.cap > 0) {
                this.prevElement += maxData;
                return this.prevElement;
            } else if (maxData < this.prevElement && this.cap > 0) {
                this.prevElement -= maxData;
                return this.prevElement;
            } else if (maxData > this.prevElement && this.cap == 0) {
                this.prevElement -= maxData;
                return this.prevElement;
            }
            else if (maxData < this.prevElement && this.cap == 0) {
                this.prevElement += maxData;
                return this.prevElement;
            }



        },

    }
});
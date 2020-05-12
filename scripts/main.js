Vue.component("generator-form", {
    template: "#formPart",
    data() {
        return {
            content: "",
            kermetFactor: 20,
            textflyFactor: 0
        }
    },
    methods: {
        generate() {
            const resource = {
                content: this.content,
                kermetFactor: this.kermetFactor,
                textflyFactor: this.textflyFactor
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
            renderables:"",
            removeForm:false
        }
    },
    methods: {
        prepareContent(e) {
            this.resource = e;
            let skipPosition = this.regexMatch();
            
            let renderables = this.splitStrings(skipPosition);
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
                            divElem = `<div style="display:block;background-color:yellow;width:${match.value[2]};height:${match.value[3]}">ssd</div>`;
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
        generateRand(){
            return Math.floor(Math.random()*3+1);
        },
        splitStrings(skipPosition) {
            //splits the strings. can't use str.split(" ") function because , there is presence of html elements ready to be rendered.
            //needs a counter to skip certain positions.

            let renderableElements=[]; 

            let bufferString = this.resource.content;
            let counter = 0;
            
            
            
            let enterCounter;
            let flag = skipPosition == 0 ? true : false;
            for (let i = 0; i < bufferString.length; i++) {
                
                if (flag == false) {
                    if (skipPosition[counter][0] == i) {
                        renderableElements.push(bufferString.substring(skipPosition[counter][0],skipPosition[counter][1]));
                        i = skipPosition[counter][1];
                        counter++;
                        if (counter == skipPosition.length) {
                            flag = true;
                        }
                    } 
                }
                if(bufferString[i]=='\n'){
                    enterCounter++;
                    if(enterCounter >= 2){
                        renderableElements.push(`<p></p>`);
                    }
                }else{
                    enterCounter=0;
                }
                renderableElements.push(`<span style="font-family:ash${this.generateRand()};font-size:40px">${bufferString[i]}</span>`);
                
                //this.resource.content = this.resource.content.replace(bufferString[i],``)
            }
            
            return renderableElements;
        }

    }
});
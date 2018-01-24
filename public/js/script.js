//vue interprets what is in the element to look at (main), and run in script, otherwise it would show the text in html
//execute everything in main

(function() {


    var app = new Vue ({
        el: 'main',
        data: {
            images: [
                //what db query returns, leave empty
            ],
            formStuff: {
                title:'',
                description:'',
                username:'',
                file: null
            }
        },
        //mounted: runs after everything is loaded
        mounted: function() {
            var that = this;
            axios.get('/images')
                .then(function(response) {
                    console.log('response from server with db query', response.data.allimages);
                    //allimages is what we get back from db query. Then fill this instace of vue.images with this data.
                    that.images = response.data.allimages;

                })
                .catch(function(err) {
                    console.log('error in axios.get /imageboard', err)
                });
        },
        methods: {
            //attached to submit button, upon submit, what do we send?
            //uploadFile only runs on button click, specify html file
            uploadFile: function(e) {
                e.preventDefault();
                console.log('uploadFile method works')
                //properties we're getting from formStuff
                const formProperties = new FormData()
                //const formDat: adds things as key value pairs, append information to formData (formProperties)
                formProperties.append('file', this.formStuff.file)
                formProperties.append('title', this.formStuff.title)
                formProperties.append('description', this.formStuff.description)
                formProperties.append('username', this.formStuff.username)

                axios.post('/upload', formProperties)
                    .then(function(results) {
                        console.log('response from server', results);
                        
                    })
                    .catch(function(err) {
                        console.log('error in axios.post /upload, formproperties did not send', err);
                    });
            },
            chooseFile: function(e) {
                //attached to input field chooseFile
                console.log('chooseFile running');
                this.formStuff.file = e.target.files[0];
                //attach file to formStuff
                //this is instance //formStuff
            }
        }
    });

})();

//post route show images with data property names 'images'. then if(there are images) for-loop to loop throught the images and show them
//write function database query, pass to app.get. What fill in here?
//make ajax request (on mounting) mounted method, then axios.get. Route axios.get (res.json)  - call db query - written somewher else- images back as res.json in axios.get
//

//app.get('/images'): and call the db query
//methods: mounted: function
//axios.get on route in server file
//app.images = response.image.images

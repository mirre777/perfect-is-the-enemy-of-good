//vue interprets what is in the element to look at (main), and run in script, otherwise it would show the text in html
//execute everything in main

(function() {


//////////////////////single image modal/////////////////////////////////
    Vue.component('image-modal', {
        props: ['imageId'],
        methods: {
            postComment: function() {
                console.log('   in postComment, this is comment: ', this.comments.comment, ', this is username: ', this.comments.username);
                axios.post('/comment', {
                    "comment": this.comments.comment,
                    "username":this.comments.username,
                    "imageId": this.imageId,
                    "created_at": this.comments.postedAt
                })
                ////////////new comment not shown in comments right away. results.data[0] return empty
                    .then(results => {
                        this.comments.unshift(results.data);
                    })
                    .catch(err => {
                        console.log('error in vue component, methods, postComment: ', err);
                    })
                this.comments.comment = '';
                this.comments.username = '';
                this.comments.postedAt = '';
            },
            /////////////fix this
            closeWindow: function() {
                console.log('   in closeWindow');
                this.singleImage = null;
                this.$emit('closed');
                console.log('this.singleImage: ', this.singleImage);
            }
        },
        data: function() {
            return {

                singleImage: null,
                comments: []
            };
        },
        mounted: function() {
            var that = this;
            axios.get(`/images/` + that.imageId)
            //all information of ONE image
                .then(resultsjson => {
                    console.log('this is singleImage: ', resultsjson.data.singleImageResults,' this is comments: ', resultsjson.data.comments);
                    console.log(resultsjson);
                    that.singleImage = resultsjson.data.singleImageResults;
                    that.comments = resultsjson.data.comments;
                })
                .catch(function(err) {
                    console.log('   error in axios.get /images/:imageId', err)
                });
        },
        template: "#modal-template"
    });


////////////////////imageboard////////////////////
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
            },
            imageId: undefined
        },
        //mounted: runs after everything is loaded
        mounted: function() {
            var that = this;
            axios.get('/images')
                .then(function(jsonresponsefromserver) {
                    console.log(jsonresponsefromserver);
                    console.log('   response from server with db query', jsonresponsefromserver.data.allimages);
                    //allimages is what we get back from db query. Then fill this instace of vue.images with this data.
                    that.images = jsonresponsefromserver.data.allimages;

                })
                .catch(function(err) {
                    console.log('   error in axios.get /imageboard', err)
                });
        },
        methods: {
            //attached to submit button, upon submit, what do we send?
            //uploadFile only runs on button click, specify html file
            uploadFile: function(e) {
                const that = this;
                e.preventDefault();
                console.log('uploadFile method works')
                //properties we're getting from formStuff
                const formProperties = new FormData()
                //const formDat: adds things as key value pairs, append information to formData (formProperties)
                formProperties.append('file', this.formStuff.file)
                formProperties.append('title', this.formStuff.title)
                formProperties.append('description', this.formStuff.description)
                formProperties.append('username', this.formStuff.username)

                //POST request containing all of the data should be made. If the image upload is successful, the server should respond with a payload containing the url of the image.
                axios.post('/upload', formProperties)
                    .then(function(results) {
                        console.log('response from server, results.data: ', results.data);
                        that.images.unshift(results.data);
                        that.formStuff = {};
                        const fileInput = document.querySelector('input[type="file"]');
                        fileInput.value = "";

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
            },
            openModal: function(imageId) {
                this.imageId = imageId;
                console.log('this.imageId: ', this.imageId);
            },
            imageIdReset: function() {
                this.imageId = null;
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

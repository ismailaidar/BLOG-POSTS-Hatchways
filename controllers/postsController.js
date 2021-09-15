var request = require('request');
var _ = require('underscore');

class PostsController {
    constructor(app) {
        this.app = app;
        this.sortByFields = ['id', 'reads', 'likes', 'popularity'];
        this.sortDirections = ['asc', 'desc'];
        this.posts = []
        this.getPosts();
    }

    /*
        Route: /api/posts
        Method: GET
        Query Parameters:
            tags: String. A comma separated list of tags
            sortBy: String. The field to sort the posts by
            direction: String. The direction for sorting
    */
    getPosts() {
        const self = this;
        // initialize posts array on every call
        this.posts = [];
        this.app.get('/api/posts', function (req, res) {
            const tagsString = req.query.tags;
            const tags = tagsString.split(',');
            const sortBy = req.query.sortBy;

            if (tagsString === undefined || tagsString === null) {
                return res.status(400).send({
                    "error": "Tags parameter is required"
                })
            }

            let fetchPostsPromises = []
            tags.forEach(function (tag) {
                fetchPostsPromises.push(self.fetchPosts(tag))
            })

            Promise.all(fetchPostsPromises)
                .then(results => { 
                    if (sortBy != undefined || sortBy != null) {
                        if (self.sortByFields.indexOf(sortBy) === -1) {
                            return res.status(400).send({
                                "error": "sortBy parameter is invalid"
                            })
                        } else {
                            self.posts =  _.sortBy(self.posts, sortBy)
                        }
                    } 
                })
                .then(posts => {
                    return res.status(200).send(self.posts)
                })
                .catch(err => {
                    return res.status(500).send('Internal Server Error!')
                })
        })
    }

    fetchPosts(tag) {
        const self = this;
        return new Promise((resolve, reject) => {
            request(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`, function (error, response, body) {
                const res = JSON.parse(body);
                for (var i = 0; i < res.posts.length; i++) {
                    var post = res.posts[i];
                    // check if this post object already exists in our posts array
                    var index = self.posts.findIndex(x => x.id == post.id);
                    if (index === -1) { // add the post to the posts array if it doesn't exist
                        self.posts.push(post)
                    }
                }
                resolve(self.posts)
            });
        })
    }

}

module.exports = (app) => { return new PostsController(app); }
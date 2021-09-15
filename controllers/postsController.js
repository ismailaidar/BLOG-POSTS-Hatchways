const request = require('request');
const _ = require('underscore');
const Redis = require('redis');


const DEFAULT_EXPIRATION = 3600;
class PostsController {
    constructor(app) {
        this.app = app;
        this.redisClient = Redis.createClient();

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
        this.app.get('/api/posts', function (req, res) {
            self.posts = [];
            console.warn('Posts initialized')
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
                            self.posts = _.sortBy(self.posts, sortBy);
                        }
                    }
                })
                .then(posts => {
                    return res.status(200).send(self.posts);
                })
                .catch(err => {
                    return res.status(500).send('Internal Server Error!')
                })
        })
    }

    fetchPosts(tag) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.redisClient.get(`posts_${tag}`, (error, ptags) => {
                if (error) console.error(error)
                // posts with this tag doesn't exist in our cashe memory
                if (ptags === null) {
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
                        self.redisClient.setex(`posts_${tag}`, DEFAULT_EXPIRATION, JSON.stringify(self.posts))
                        resolve(self.posts)
                    });
                } else {
                    // we already have posts with this tag so let's just get them from the cashe memory
                    // if the tag is chashed that means posts related to it are cashed too.
                    self.redisClient.get(`posts_${tag}`, (error, rposts) => {
                        const posts = JSON.parse(rposts)
                        for (var i = 0; i < posts.length; i++) {
                            var post = posts[i];
                            // check if this post object already exists in our posts array
                            var index = self.posts.findIndex(x => x.id == post.id);
                            if (index === -1) { // add the post to the posts array if it doesn't exist
                                self.posts.push(post)
                            }
                        }
                        resolve(self.posts)
                    })
                }
            })
        })
        console.log('finish')
    }

}

module.exports = (app) => { return new PostsController(app); }
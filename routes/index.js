const postRoutes = require('./posts');

const constructorMethod = (app) => {
    app.use('/', postRoutes);
    app.use('*', (req, res) => {
        return res.render('pages/error', {title: "Error", error: "Page not found"});
    });
};

module.exports = constructorMethod;
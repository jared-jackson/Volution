'use strict';
var ApiBuilder = require('claudia-api-builder');
var cheerio = require('cheerio');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var request = require('request');
var RSVP = require('rsvp');

var api = new ApiBuilder();


// Approach 1 works, but has a race condition
api.get('/', function (req) {
    var analyze_url = req.queryString.url;


    var promise = new RSVP.Promise(function (resolve, reject) {
        console.log("inside promise");
        request(analyze_url, function (error, response, html) {
            console.log("inside the request");
            var article_content = "";
            if (!error) {
                var $ = cheerio.load(html);
                $('.post-content').filter(function () {
                    var data = $(this);
                    article_content = data.parent().children().text().trim();
                    resolve(article_content);
                });
            } else {
                reject(error);
            }
        });
    });
    promise.then(function (value) {
        console.log(value + "We logged the .then. That's good news");
        var watson_response = "";
         var article_content = value.toString();

        var nlu = new NaturalLanguageUnderstandingV1({
            username: 'f1a68365-b09e-4ad1-b17e-52a0d5f80f4c',
            password: 'JBAtZWNXWqy6',
            version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
        });
        var analyze_text = article_content.toString();
        console.log("ANALYZING TEXT" + analyze_text);
        //I think nlu.analyze is finishing before request completes its call to get the html
        nlu.analyze({
            'html': analyze_text,
            'features': {
                'concepts': {},
                'keywords': {},
                'emotion': {}
            }
        }, function (err, response) {
            console.log(err, "The interal server error we're getting")
            if (err) {
                reject(err);
            } else {
                watson_response = response.emotion.document.emotion;
                console.log("RESPONSE " + watson_response);
                resolve(watson_response);
            }
        });
    }).catch(function (error) {
        // failure
    });



    // return new RSVP.Promise(function (resolve, reject) {
    //     console.log("initial");
    //     request(analyze_url, function (error, response, html) {
    //         console.log("inside the request");
    //         var article_content = "";
    //         if (!error) {
    //             var $ = cheerio.load(html);
    //             var watson_response = "";
    //             $('.post-content').filter(function () {
    //                 var data = $(this);
    //                 article_content = data.parent().children().text().trim();
    //             });
    //             var nlu = new NaturalLanguageUnderstandingV1({
    //                 username: 'f1a68365-b09e-4ad1-b17e-52a0d5f80f4c',
    //                 password: 'JBAtZWNXWqy6',
    //                 version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
    //             });
    //             var analyze_text = article_content.toString();
    //             console.log(analyze_text);
    //
    //             //I think nlu.analyze is finishing before request completes its call to get the html
    //             nlu.analyze({
    //                 'html': analyze_text,
    //                 'features': {
    //                     'concepts': {},
    //                     'keywords': {},
    //                     'emotion': {}
    //                 }
    //             }, function (err, response) {
    //                 console.log(err, "The interal server error we're getting")
    //                 if (err) {
    //                     reject(err);
    //                 } else {
    //                     watson_response = response.emotion.document.emotion;
    //                     console.log(watson_response);
    //                     resolve(watson_response);
    //                 }
    //             });
    //         }
    //     })
    // });


}, {success: {contentType: 'application/json'}});


//Approach 2

// api.get('/', function (req) {
//     var analyze_url = req.queryString.url;
//     console.log("HERE?");
//     request(analyze_url, function (error, response, html) {
//         console.log("Inside Request" + html);
//         var article_content = "";
//         if (!error) {
//             var $ = cheerio.load(html);
//             var test = "";
//             $('.post-content').filter(function () {
//                 var data = $(this);
//                 article_content = data.parent().children().text().trim();
//
//             });
//             var analyze_content = test.toString();
//             console.log(analyze_content);
//             return new RSVP.Promise(function (resolve, reject) {
//                 var nlu = new NaturalLanguageUnderstandingV1({
//                     username: 'f1a68365-b09e-4ad1-b17e-52a0d5f80f4c',
//                     password: 'JBAtZWNXWqy6',
//                     version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
//                 });
//                 nlu.analyze({
//                     'html': analyze_content,
//                     'features': {
//                         'concepts': {},
//                         'keywords': {},
//                         'emotion': {}
//                     }
//                 }, function (err, response) {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         test = response.emotion.document.emotion;
//                         resolve(test);
//                     }
//                 });
//             });
//         }
//     });
// }, {success: {contentType: 'application/json'}});


module.exports = api;

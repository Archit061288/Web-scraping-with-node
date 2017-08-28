var express = require('express');
var json2csv = require('json2csv');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var mkdirp = require('mkdirp');
var app = express();
var oneinc = 1;
var flag = false;
app.get('/api/scrape', function(req, res) {

    var base_url = "https://www.aceindustries.com";
    var url = 'https://www.aceindustries.com/sitemap.aspx';
    var pagesize = 100;
    var pagenum = 1;
    var download_dir = './images/';
    //var siteurl = "c-2-electric-chain-hoists.aspx?pagesize=24";
    var jsonarr = [];
    var finaldata = [];
    var subcategory = [];
    var fields = [
        'product_url',
        'brand',
        'model',
        'weight',
        'sku',
        'category',
        'product_name',
        'product_image',
        'product_description',
        'PDFs',
        'Nested Category',
        'base_price',
        'sale_price',
        'Attribute 1 name',
        'Attribute 1 value(s)',
        'Attribute 1 value(s) with prices',
        'Attribute 1 visible',
        'Attribute 2 name',
        'Attribute 2 value(s)',
        'Attribute 2 value(s) with prices',
        'Attribute 2 visible',
        'Attribute 3 name',
        'Attribute 3 value(s)',
        'Attribute 3 value(s) with prices',
        'Attribute 3 visible',
        'Attribute 4 name',
        'Attribute 4 value(s)',
        'Attribute 4 value(s) with prices',
        'Attribute 4 visible',
        'Attribute 5 name',
        'Attribute 5 value(s)',
        'Attribute 5 value(s) with prices',
        'Attribute 5 visible',
        'Attribute 6 name',
        'Attribute 6 value(s)',
        'Attribute 6 value(s) with prices',
        'Attribute 6 visible',
        'Attribute 7 name',
        'Attribute 7 value(s)',
        'Attribute 7 value(s) with prices',
        'Attribute 7 visible',
        'Attribute 8 name',
        'Attribute 8 value(s)',
        'Attribute 8 value(s) with prices',
        'Attribute 8 visible',
        'Attribute 9 name',
        'Attribute 9 value(s)',
        'Attribute 9 value(s) with prices',
        'Attribute 9 visible',
        'Attribute 10 name',
        'Attribute 10 value(s)',
        'Attribute 10 value(s) with prices',
        'Attribute 10 visible'
    ];
    var inc = 0;
    var insertlink = [];
    var parentarr = [];
    var mainarr = [];
    var subarr = [];
    var maincategory = [];

    request(url, function(error, response, html) {

            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                $('.page-row .one-third:first-child div.site-map-group:first-child ul').first().children("li").each(function(index, value) {

                    $(this).children("ul").children("li").each(function(ind, val) {
                        var linkurl = $(this).children("a").attr("href");
                        var mainlink = base_url + linkurl;
                        jsonarr.push(mainlink);
                        subcategory.push($(this).children("a").text())
                        maincategory.push($(this).parents("li").children("a").first().text());
                    })

                }) // end of page row each
                console.log(jsonarr, "jsonarr")
                if (jsonarr.length > 0) {
                    var parent_url = jsonarr[0];
                    var sub_category = subcategory[0];
                    var main_category = maincategory[0];
                    //var parent_url = 'https://www.aceindustries.com/c-2-electric-chain-hoists.aspx';
                    console.log(parent_url, "url1")
                    console.log(sub_category,"--",main_category)

                    var scrapfunct = function(parent_url, pagenum,sub_category,main_category) {
                        oneinc++;
                        console.log("herescrap", parent_url, pagenum, "onenum", oneinc)
                        async.eachSeries(parent_url, function(parent_url, next) {
                                request(parent_url + '?pagesize=' + pagesize + '&pagenum=' + pagenum, function(error, response, html) {
                                            if (!error) {
                                                var $ = cheerio.load(html);

                                                var prod_length = $("#product-row").children("div");
                                                console.log(prod_length.length, "prod_length")
                                                if (prod_length.length > 0) {

                                                    var j = 0;
                                                    var jsonsubarr = [];
                                                    $("#product-row").children("div").each(function(indx) {
                                                        console.log("if")
                                                        var product_url = $(this).find(".guidedNavImageWrap a").attr("href");
                                                        var subprodurl = base_url + product_url;
                                                        jsonsubarr.push(subprodurl);
                                                    })
                                                    console.log(jsonsubarr, "jsonsubarr");
                                                    if (jsonsubarr.length > 0) {
                                                        async.eachSeries(jsonsubarr, function(url, next) {
                                                                    console.log(url, "url2")

                                                                    request(url, function(error, response, html) {
                                                                            if (error) {
                                                                                console.log('error:', error);
                                                                            }
                                                                            j++;
                                                                            console.log("else")
                                                                            var obj = {};
                                                                            var imgarr = [];
                                                                            if (response.body) {
                                                                                var $ = cheerio.load(response.body);
                                                                                
                                                                                var prod_url = $(".product-info").children("[itemprop='url']").attr("content");
                                                                                var prod_sku = $(".product-info").children("[itemprop='sku']").attr("content");
                                                                                //var prod_name = $(".product-description h2").text();
                                                                                
                                                                                var prod_image = $(".product-info").children("[itemprop='image']").attr("content");
                                                                                //var prod_desc = $(".product-description").find("p").first().text() + "" + $(".product-description").find("p:nth-child(2)").text()
                                                                                var prod_desc = $(".product-description").html();
                                                                                if (prod_desc == "" || prod_desc == undefined) {
                                                                                    if($(".product-description-wrap").length > 0){
                                                                                        prod_desc =  $(".product-description-wrap").html();
                                                                                        prod_desc = prod_desc.replace(/[\t\n\r]+/g, '');    
                                                                                    }else{
                                                                                        prod_desc = "";
                                                                                    }
                                                                                    
                                                                                }else{
                                                                                   prod_desc =  $(".product-description").html();
                                                                                   prod_desc = prod_desc.replace(/[\t\n\r]+/g, '');
                                                                                }
                                                                                //var nestedfirst = $(".breadcrumb span.SectionTitleText").html().replace(/&#x2192;/g,'');
                                                                                
                                                                                
                                                                                //var nestedfirst = $(".breadcrumb-row span.SectionTitleText a.SectionTitleText").first().text();
                                                                                //var nestedcategory = nestedfirst + ','+ nestedlast;
                                                                                var medium_img = base_url + $(".medium-image-wrap").find("img").attr("src");

                                                                                if (prod_url == "" || prod_url == undefined) {
                                                                                    var prod_url = $(".product-page").children("[itemprop='url']").attr("content");
                                                                                }
                                                                                if (prod_sku == "" || prod_sku == undefined) {
                                                                                    var prod_sku = $(".variant-price").find("span").first().children("[itemprop='sku']").attr("content");
                                                                                }
                                                                                
                                                                                if (prod_image == "" || prod_image == undefined) {
                                                                                    var prod_image = $(".variant-price").find("span").first().children("[itemprop='image']").attr("content");
                                                                                }
                                                                                
                                                                                var strstring = $(".breadcrumb").find("span.SectionTitleText").html();
                                                                                prod_name = strstring.substring(strstring.lastIndexOf("&#x2192;")+8).trim();
                                                                                
                                                                                console.log(prod_name,"prod_name")
                                                                                
                                                                                //  'Attribute 7 name',
                                                                                // 'Attribute 7 value(s)',
                                                                                // 'Attribute 7 value(s) with prices',
                                                                                // 'Attribute 7 visible',
                                                                                if ($(".kit-groups div.kit-group").length > 0) {

                                                                                    $(".kit-groups div.kit-group").each(function(index, val) {
                                                                                        var temparrprice = [],
                                                                                            temparr = [],
                                                                                            temparr1 = [];
                                                                                        var tempindex = index + 1;
                                                                                        obj['Attribute ' + tempindex + ' name'] = $(this).find("span#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_Label1").text();
                                                                                        if ($("#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlGroupContent div#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlUpdateKitItems select option").length > 0) {
                                                                                            $("#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlGroupContent div#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlUpdateKitItems select option").each(function(i, v) {
                                                                                                if ($(v).text().match(/\[/g)) {
                                                                                                    temparr = $(v).text().split("[");
                                                                                                    temparr1.push(temparr[0]);
                                                                                                } else {
                                                                                                    temparr = $(v).text();
                                                                                                    temparr1.push(temparr);
                                                                                                }
                                                                                                temparrprice.push($(v).text().trim());
                                                                                            })
                                                                                        } else if ($("#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlGroupContent div#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlUpdateKitItems .kit-group-item-wrap").length > 0) {
                                                                                            $("#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlGroupContent div#ctl00_PageContent_rptKitGroups_ctl0" + index + "_ctrlKitGroupTemplate_pnlUpdateKitItems .kit-group-item-wrap").each(function(ind, vall) {
                                                                                                if ($(vall).find("span").text().match(/\[/g)) {
                                                                                                    temparr = $(vall).text().split("[");
                                                                                                    temparr1.push(temparr[0].trim());
                                                                                                } else {
                                                                                                    temparr = $(vall).text();
                                                                                                    temparr1.push(temparr.trim());
                                                                                                }
                                                                                                temparrprice.push($(vall).text().trim());
                                                                                            })
                                                                                        }
                                                                                        obj['Attribute ' + tempindex + ' value(s)'] = temparr1.join();
                                                                                        obj['Attribute ' + tempindex + ' value(s) with prices'] = temparrprice.join();
                                                                                        obj['Attribute ' + tempindex + ' visible'] = 1;
                                                                                    })
                                                                                }

                                                                                var pusharrpdf = [];
                                                                                if ($('h3:contains("Downloads and Other Documents")').length > 0) {
                                                                                    if ($('h3:contains("Downloads and Other Documents")').next("ul").length > 0) {
                                                                                        $('h3:contains("Downloads and Other Documents")').next("ul").children().each(function(ind, val) {
                                                                                            pusharrpdf.push(base_url + $(val).find("a").attr("href"));
                                                                                        })
                                                                                    } else {
                                                                                        $('h3:contains("Downloads and Other Documents")').nextAll().each(function(ind, val) {
                                                                                            pusharrpdf.push(base_url + $(val).find("a").attr("href"));
                                                                                        })
                                                                                    }

                                                                                } else if ($('h3:contains("Product Brochure")').length > 0) {
                                                                                    $('h3:contains("Product Brochure")').nextAll().each(function(ind, val) {
                                                                                        pusharrpdf.push(base_url + '/' + $(val).find("a").attr("href"));
                                                                                    })

                                                                                } else if ($('h3:contains("Product Downloads")').length > 0) {
                                                                                    $('h3:contains("Product Downloads")').nextAll().each(function(ind, val) {
                                                                                        pusharrpdf.push(base_url + '/' + $(val).find("a").attr("href"));
                                                                                    })

                                                                                } else if ($("#documentation").length > 0) {

                                                                                    pusharrpdf.push(base_url + '/' + $("#documentation").children("a").attr("href"));

                                                                                } else if ($('h4:contains("Downloads and Specifications")').length > 0) {
                                                                                    $('h4:contains("Downloads and Specifications")').nextAll().each(function(ind, val) {
                                                                                        pusharrpdf.push(base_url + $(val).find("a").attr("href"));
                                                                                    })
                                                                                }else if ($('h3:contains("DOWNLOADS")').length > 0) {
                                                                                    $('h3:contains("DOWNLOADS")').next("ul").children().each(function(ind, val) {
                                                                                        pusharrpdf.push(base_url + $(val).find("a").attr("href"));
                                                                                    })
                                                                                }

                                                                                var base_price = ($(".kit-base-price").text()) ? $(".kit-base-price").text().split(":")[1].trim() : "";

                                                                                if (base_price == "" || base_price == "undefined") {
                                                                                    var base_price = ($(".regular-price").text()) ? $(".regular-price").text().split(":")[1].trim() : "";
                                                                                    if(base_price == "" || base_price == "undefined"){
                                                                                       var base_price =  $(".price-wrap").children("[itemprop='price']").attr("content");
                                                                                    }
                                                                                }



                                                                                var sale_price = ($(".sale-price").text()) ? $(".sale-price").text().split(":")[1].trim() : "";

                                                                                if ($('h3:contains("Product Details")').length > 0) {
                                                                                    obj.brand = $('h3:contains("Product Details")').next("div").find("tr").first().find("td").last().text().trim();
                                                                                    //obj.brand = $('h3:contains("Product Details")').next("div").find("tr:first td:last").text().trim();
                                                                                    obj.model = $('h3:contains("Product Details")').next("div").find("tr:nth-child(2)").find("td").last().text().trim();
                                                                                    obj.weight = $('h3:contains("Product Details")').next("div").find("tr").last().find("td").last().text().trim();
                                                                                } else if ($('h3:contains("Technical Details")').length > 0) {
                                                                                    obj.brand = $('h3:contains("Technical Details")').next("p").text().split(":")[1].trim();
                                                                                    obj.model = $('h3:contains("Technical Details")').next("p").next("p").text().split(":")[1].trim();
                                                                                    obj.weight = $('h3:contains("Technical Details")').next("p").next("p").next("p").text().split(":")[1].trim();
                                                                                }

                                                                                
                                                                            obj['Nested Category'] = main_category +',' + sub_category + ',' + prod_name;    
                                                                            obj.product_url = prod_url;
                                                                            obj.sku = prod_sku;
                                                                            obj.product_name = prod_name;
                                                                            obj.product_image = prod_image;
                                                                            obj.product_description = prod_desc;
                                                                            obj.category = main_category;
                                                                            obj.PDFs = pusharrpdf.join();
                                                                            obj.base_price = base_price;
                                                                            obj.sale_price = sale_price;

                                                                            finaldata.push(obj);
                                                                            
                                                                            console.log(main_category,"maincategory",sub_category,"sub_category")
                                                                            
                                                                            var csv = json2csv({ data: finaldata, fields: fields });
                                                                            fs.writeFile('file.csv', csv, function(err) {
                                                                                if (err) throw err;
                                                                            });

                                                                            console.log(j, "j", prod_length.length)
                                                                            setTimeout(function() {
                                                                                next();
                                                                            }, 300)
                                                                        } else {
                                                                            console.log("errorrrr")
                                                                        }
                                                                    })


                                                            },
                                                            function() {
                                                                parentarr = [];
                                                                mainarr = "";
                                                                subarr = "";
                                                                console.log("finished1")
                                                                pagenum++;
                                                                parentarr.push(parent_url);
                                                                mainarr = main_category;
                                                                subarr = sub_category;
                                                                scrapfunct(parentarr, pagenum, subarr, mainarr);
                                                            })
                                                }
                                            } else {

                                                insertlink.push(jsonarr[inc])
                                                console.log(insertlink, "insertlink")

                                                // var csv = json2csv({ data: finaldata, fields: fields });
                                                // fs.writeFile('file.csv', csv, function(err) {
                                                //     if (err) throw err;
                                                // });

                                                inc++;
                                                pagenum = 1;
                                                console.log(jsonarr[inc], "jsonarr[inc]")
                                                console.log(subcategory[inc],"subcategory[inc]")
                                                console.log(maincategory[inc],"maincategory[inc]")

                                                if (jsonarr[inc] == "" || jsonarr[inc] == undefined) {
                                                    console.log("File Saved Successfully");
                                                    res.send("File Saved Successfully");
                                                } else {
                                                    setTimeout(function() {
                                                        parentarr = [];
                                                        mainarr = "";
                                                        subarr = "";
                                                        parentarr.push(jsonarr[inc]);
                                                        subarr = subcategory[inc];
                                                        mainarr = maincategory[inc]
                                                        scrapfunct(parentarr, pagenum,subarr, mainarr);
                                                    }, 200)
                                                }


                                            }
                                        }
                                        return false;
                                    },
                                    function() {
                                        console.log("finished3")

                                    }); // end of first request
                            return false;
                        })

                }
                if (oneinc == 1) {
                    console.log(oneinc)
                    parentarr.push(parent_url);
                    scrapfunct(parentarr, pagenum,sub_category,main_category);
                }

            }
        }
        return false;
    })
})

app.listen('8081');
console.log('Server listening on port 8081');
exports = module.exports = app;


// · URL to product -- itemprop="url"
// · SKU -- done
// · Product Name-- done
// · Product Description -- Product Description 
// · Product Details (if available) -- Product Details 
// · Product Features (if available) -- Product Features
// · List Price
// · Price -- kit-base-price
// · Sale Price (if displayed) -- 
// · Product Photo file name(s) with photos downloaded
// · Downloads and other documents -- Downloads and Other Documents
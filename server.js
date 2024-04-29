const express = require('express');
const cors = require('cors');
const config = require('./config');
const ip = require('ip');
const ip6 = require('ip-address').Address6;
const { IPv6 } = require('ip-toolkit');
const { IPv4 } = require('ip-toolkit');
const mongoose = require('mongoose');
const PORT = config.server.port;

const app = express();

// mongoose connect
const mongoUrl = config.database.mongoUrl;
const db = mongoose.connect(mongoUrl);

// cors middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
}));

// route handler
app.post('/cidr/ipv4', (req, res) => {
    // 172.16.1.1

    // if valid IP but not CIDR then ask user to write CIDR
    let isValidIp4 = IPv4.isValidIP(req.body.cidr)
    let isIpv4 = IPv4.isCIDR(req.body.cidr)

    // if ipv4
    if(isValidIp4 || isIpv4) {
        if(isIpv4) {
            const ipv4 = IPv4.parseCIDR(req.body.cidr)
            const payload = {
                cidr: req.body.cidr,
                result: ipv4,
            } 
            res.status(200).json(payload) 
        } else {
            res.json({err: "Not valid CIDR notation Eg: 128.24.24.1/32"})
        }    
    }  
     
});

// route handler
app.post('/cidr/ipv6', (req, res) => {
    // 2001:0:ce49:7601:e866:efff:62c3:fffe/33

    // if valid IP but not CIDR then ask user to write CIDR
    let isValidIp6 = IPv6.isValidIP(req.body.cidr)
    let isIpv6 = IPv6.isCIDR(req.body.cidr)
    
    // if ipv6
    if(isValidIp6 || isIpv6) {
        if(isIpv6) {
            const s = IPv6.parseCIDR(req.body.cidr)
            const payload = {
                cidr: req.body.cidr,
                result: {
                    ipCount: s.ipCount.toString(),
                    firstHost: s.firstHost,
                    lastHost: s.lastHost,
                    cidrMask: s.prefixLength,
                    usableCount: '2^'+(128 - s.prefixLength),
                }
            }
            res.status(200).json(payload) 
        } else {
            res.json({err: "Not valid IPv6 CIDR. Eg: 1411:1a11:2d53:fae2:::6432/48"})
        }
    } 
});


if(db) {
    app.listen(PORT, (err, client) => {
        if(err) console.log(err.message)
        console.log('server connected at PORT: ', PORT)
        console.log('MongoDB database is connected.')
    });
}
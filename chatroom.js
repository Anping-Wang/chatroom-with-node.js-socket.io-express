'use strict';
const path = require('path');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'index.html'))
});
let users = {};
let count = 0;
io.on('connection',(socket) => {
    console.log('connecting...');
    socket.on('login',(data) => {
        //因为每个用户的socket对象是独立的，利用这个特性，把每个用户的用户名信息存到自己的socket对象上
        socket.username = data;
        count++;
        users[data]=data;
        // console.log(username);
        socket.emit('welcome',data);
        socket.broadcast.emit('welcome',data);
        socket.emit('list',{count:count,users:users});
        socket.broadcast.emit('list',{count:count,users:users});
    });
    socket.on('publish',function (data) {
        socket.emit('publish',{username:socket.username,msg:data});
        socket.broadcast.emit('publish',{username:socket.username,msg:data});
    });
    //注册用户注销事件
    socket.on('disconnect',function () {
        let user = socket.username;
        //在线用户数减一
        count--;
        //用户名称更新
        delete users[user];
        //告知其它用户
        socket.broadcast.emit('logout',user);
        //更新用户列表
        socket.broadcast.emit('list',{count:count,users:users});
    })
});

server.listen(4000,() => {
    console.log('server is listening in port 4000')
});
// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.203
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["《求是》发表习近平总书记重要文章", "环球时报：坚决反对网暴《南京照相馆》", "女生拆录取通知发现夹带他人通知书", "超燃《攻坚》MV发布", "厦大陈同学为何在网上出口成“脏”", "一高校在广西招生现“零投档”现象", "净网2025：防汛抗灾不容谣言添乱", "日本警方通报2中国人东京遭4人殴打", "《哪吒2》将于8月2日全网上线", "北京极端强降雨致44人死亡9人失联", "外交部：中国公民近期谨慎前往日本", "日本一白领女性上班照意外走红", "女子婚后1年发现丈夫患艾滋病12年", "杨颖出租和黄晓明的婚房", "日本遭殴打中国人称不认识袭击者", "北京4名村支书因救灾失踪失联", "业主踩狗屎摔成十级伤残 自己担主责", "1.5米高海啸袭击日本港口现场曝光", "武大回应法院驳回对性骚扰男生指控", "广东女子发现电影院座椅布满虫卵", "汪苏泷张碧晨上个月还在聚餐", "上海一小区四季恒温", "李明德被判有期徒刑6个月", "佛山释放不咬人蚊子捕食咬人蚊子", "北京一村支书夫妇救援时被洪水冲走", "全球第二网红将于9月开启中国行", "实拍密云孤岛村庄：超百名老人受困", "密云区委书记泪洒发布会", "北京密云一养老中心因灾死亡31人", "外交部回应2名中国人在日被打重伤", "冷冻31年“世界最老婴儿”诞生", "中汽研回应理想对撞乘龙卡车争议", "西班牙一小镇“禁死令”引关注", "洪水中儿子硬把妈妈推上飞机", "陈芋汐世锦赛10米台第四冠", "台风“竹节草”过境宁波余姚致洪灾", "兵种军旗发布！组图来了", "延期4年未交房 业主起诉开发商败诉", "汪苏泷张碧晨一鱼两吃如何引起大战", "俄罗斯发布红军城方向作战视频", "考生食用豆角盒饭中毒？官方通报", "加拿大承认巴勒斯坦国遭特朗普威胁", "阿拉伯国家首次谴责哈马斯", "骑马相撞致马匹死亡当事人已赔钱", "2名中国人在日本街头遭4人殴打重伤", "北京防汛救灾发布会集体默哀", "女子选88888车牌卖280万？当地回应", "每日付费30元假装上班 为何有人买单", "李嘉诚家族甩货大湾区400套房源", "密云太师屯镇养老中心受灾经过公布", "8.7级强震后的海啸为何如此“温和”"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}

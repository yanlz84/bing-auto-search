// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.219
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
var default_search_words = ["“人生能得几次搏”", "习近平同普京通电话", "外卖小哥王佳皓被北大录取", "降雨影响豫粤 防汛抗洪加紧展开", "局部暴雨全景原来长这样", "北京符合条件家庭五环外购房不限套数", "李嫣近照曝光 气质冷艳如翻版王菲", "五台山徒步人员伤亡？网民造谣被拘", "李连杰官宣大女儿将结婚 送车当礼物", "甘肃榆中县山洪灾害已致10死33失联", "情侣吵架女子因用力过猛坠楼身亡", "60岁张曼玉突然罕见露面", "马库斯：要向中国人民道歉", "农民工如厕被气枪误杀 工友发声", "小孩踩空玻璃栈道挂半空 景区回应", "雷军向海外转50亿美元？小米辟谣", "54岁陈志朋去做团播了", "中方回应特朗普或对华征收次级关税", "郑州暴雨水深及腰 民众手拉手搭人桥", "李想回应理想被黑：知道是谁干的", "广岛原爆生还者：应向中国道歉", "广州白云区山体垮塌致7人遇难", "国防部回应福建舰近况", "台湾是中国的一个省哪来国防预算", "国防部回应《南京照相馆》等电影上映", "男子梦中被追跳下3楼 醒来在空中", "菲律宾抓扣9名中国公民 中使馆表态", "中国女子坠入东京大学烟囱身亡", "女子称坐卧铺发现床虱 12306回应", "兰州启动洪水防御一级应急响应", "姐妹俩站在自家饭店门口当门童", "农民工被枪击身亡 3个问题值得追问", "夫妇埋葬完被撞的狗发现车漏油", "警方介入男子砸墙泄流隔壁小区", "民工被误杀时钱包只剩两块钱", "#北京的雨专淋打工人#", "胖东来招聘1千人：200个给退伍军人", "被特朗普要求辞职后 英特尔CEO发声", "每天低头玩手机 大学生突发高位截瘫", "3女子吃夜宵遭邻桌男子辱骂恐吓", "10个年轻人抓不住尹锡悦", "大专女生5年揉面万次成烘焙世界冠军", "公司表扬加班员工：最长加159小时", "男子想领退休金发现被宣告死亡19年", "北大录取通知书的问题不大但也不美", "莫迪访华消息何以牵动世界目光", "扬州千万大奖得主最后时刻现身", "于正宣布要演戏：得演帅哥", "女子住酒店欲洗澡 陌生男子刷卡闯入", "4000万只“绝育雄蚊”出战", "迪丽热巴《利剑玫瑰》热播登7月沸点榜"]

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

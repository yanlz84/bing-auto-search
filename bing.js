// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.248
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
var default_search_words = ["描绘新时代西藏发展新画卷", "理发师给女孩擦碎发时被指猥亵", "女子称姓苟影响工作生活 申请改姓", "今年全国已吸收外资4673.4亿元", "特朗普展示与普京合影：拍得不错", "女子刷视频刷出失散30年的亲生母亲", "巴基斯坦：完全信任中国 毫不动摇", "猪价跌入“6元时代”", "“为了纸片人我和男朋友分手了”", "人民日报三问尖扎黄河特大桥事故", "阅兵方队：横看一条线 竖看一个人", "广州在住宅区喷剧毒农药？谣言", "高一女生军训第4天倒地后死亡", "当地回应代驾司机撞倒2名女生致死", "林诗栋蒯曼欧洲大满贯夺冠", "加拿大一省长：很快前往中国寻求谈判", "被错误羁押6千天男子申请国赔1911万", "广州迎本世纪以来“最冷8月”", "专家：慢牛需要“冷板凳”思维", "大桥施工绳索断裂事故致12死4失联", "小学生源减少 小学教师到高中任教", "英特尔与美国政府达成股份收购协议", "中方回应“乌称不需中国提供安保”", "赚不到钱的酒店机器人该何去何从", "陈铭曝亲哥曾被绑架致残", "国乒包揽欧洲大满贯女单四强", "英伟达暂停H20芯片生产 外交部回应", "普京：俄美关系出现曙光", "想关免密支付为啥那么难", "女子办虚假户口簿领出近10万养老金", "班主任用小号给女学生发不雅信息", "普通花露水没驱蚊效果", "卤味巨头集体“抢餐饮店生意”", "牛弹琴：特朗普现在爱恨交加", "2人为争夺758万大奖所有权闹上法庭", "二手平台售卖南极地衣 1百年长1毫米", "医学生被安排电子厂实习还被扣工资", "美股三大指数集体收涨", "女子悬赏上海一套房寻子：6代单传", "今年第13号台风即将于今天生成", "湖南2岁多女童家门口玩耍时失踪", "江苏一医院开设“浑身不得劲门诊”", "内蒙古自治区政府主席王莉霞被查", "男子打胰岛素1月后发现针套没摘", "美国国防情报局局长被解职", "朝鲜称韩军曾进行10余次警告射击", "王曼昱4-2逆转桥本帆乃香", "黄渤担心遗传父母的阿尔兹海默症", "陈熠WTT半决赛将战孙颖莎", "鲍威尔暗示美联储或在9月降息", "孙颖莎回应对伊藤美诚11连胜"]

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

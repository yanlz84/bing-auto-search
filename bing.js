// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.403
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
var default_search_words = ["从革命文化中赓续红色血脉", "这些照片千万别发在朋友圈", "“全网最像夫妻”回应被建议测DNA", "全运会赛程日历来了", "高校保洁阿姨手搓银杏叶周边", "衣服吊牌和A4纸一样大了", "高铁票买到19排但车厢只有17排", "哪些省份被纳入航母命名库？海军回应", "四川妹子想去湖南发展希望月薪2万", "华为将发布新款手表 售价6499元起", "纽约用带盖垃圾桶 市长：革命性创意", "当地辟谣饭店老板患艾滋病仍经营", "TVB老戏骨凌汉被证实已去世", "模仿死刑犯劳荣枝起号击穿良知底线", "95后“最帅村干部”柿子树前秀肌肉", "KPL年度总决赛：AG超玩会vs狼队", "阳性率上升！这种病毒也开始高发", "女子在小区里遛企鹅 社区：违法", "郑丽文祭拜吴石将军 鞠躬献花", "陈芋汐断层晋级10米台决赛", "《繁花》剧组回应王家卫录音争议", "吴彦祖教你学英语", "双一流本科女生毕业3年后上技校", "30岁小伙长期熬夜智力退回3岁", "空乘穿毛衣被吐槽土 山东航空回应", "2025福布斯中国内地富豪榜发布", "林肯中国总裁：中国豪车用户平均35岁", "女主播控诉网红教唆吸毒 警方介入", "中方同意荷方派员来华磋商的请求", "大雪、大暴雨、特大暴雨！这些地方注意", "上海一螺蛳粉店起名陆丝芬引争议", "中国人连睡觉都有浪漫感", "郑州一小吃店最贵的饭不超过5元", "六万人在鸟巢观战KPL年度总决赛", "俄外长与普京关系紧张？克宫回应", "“广东省鞋”全运会上又出圈了", "你吃到的鹅肝很可能是鸭肝", "福建舰常驻地是三亚军港", "哈尔滨上演“泼天雪花向上飞”", "美国机场员工称快被生活压垮了", "“人均ADHD”引热议", "酒店回应向抽烟客人收1000元清理费", "车厘子已上市 有水果店一斤近百元", "Prada别针式胸针门店售价近6000元", "“地表最难”乒乓赛来了", "Faker夸赞成都火锅", "狼队领先一万经济遭AG翻盘", "黄海部分海域进行火箭发射禁止驶入", "韩红献唱KPL鸟巢决赛夜", "王硕威是福建舰总设计师？官方辟谣", "吴彦祖喊你一起学英语"]

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

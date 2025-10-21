// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.366
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
var default_search_words = ["党的二十届四中全会在北京举行", "面筋爷爷酷似袁隆平走红 家属发声", "香港飞机坠海遇难者在水下7米被找到", "十四五规划这个字的重要性前所未有", "多款知名进口药告别国内市场", "石破内阁集体辞职", "公安部公布10起整治谣言典型案例", "“隔夜水最好不要喝”具象化了", "解放军正告澳方立即停止侵权挑衅", "引领未来 中国做对了什么", "00后对出莫言上联获10万奖金", "演员赵荀公布重伤十年治疗画面", "黄金连涨9周后高台跳水", "临聘人员偷拍军事装备发家庭群泄密", "坐高铁再也不用扛行李了", "嫦娥六号月壤中发现“天外来物”", "“全球最快高铁”要来了", "牛弹琴：特朗普被印度气坏了", "消防员和民警凌晨被困同一电梯", "美特使对以总理发出警告", "收费2万元/人 胖东来推企业开放日", "三股力量助郑丽文上位", "赖岳谦与妻子首次回乡祭祖", "男子花近30万闪婚一月后人财两空", "东北网友拍下燕子滞留未南飞", "北方人啥时候吃上的南方特产", "入户登记即将启动 请积极配合", "苹果大涨近4% 热门中概股集体上涨", "烤肉店用玉米做燃料被指浪费", "花花啃大饼啃得脸变形", "李在明称韩要成为全球第4大防务强国", "第一眼“报仇瓜” 了解完“报恩瓜”", "直播间“热销”假象调查", "“北京 你实在太冷了”", "大爷捡废品捡到“酒”把自己喝进ICU", "以军一天内向加沙投放153吨炸弹", "莫迪登上印度首艘国产航母", "男子偷30万藏备胎里被批捕", "曝萨科齐入狱前与马克龙秘密会见", "55名中国iPhone用户联合投诉苹果", "美核安全管理局开始强制休假", "全球消费者买金习惯发生改变", "北京多家星级酒店设外摆 价格亲民", "国考报名热门岗位已两千挑一", "“今年双11 我的AI比我还忙”", "泽连斯基：俄乌冲突接近结束", "萨科齐将入狱服刑 牢房或有小电视", "加拿大总理：若以总理入境会逮捕他", "顶级博物馆的安保何以不堪一击", "以称数名巴武装分子越线并向以开火", "俄控制又一居民点 乌打击俄多个目标"]

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

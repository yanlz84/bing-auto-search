// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.37
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
var default_search_words = ["中俄元首会谈达成哪些新的重要共识", "普京警卫携带的黑色手提箱抢镜", "5月10日起结婚离婚不需要户口本", "双边关系再添动力 全球治理展现担当", "普京在红场与朝鲜军官拥抱握手", "医院回应3岁女孩铊中毒：系人为投毒", "靳东又有新身份", "环球小姐李思萱学历造假 获刑240天", "俄罗斯胜利日阅兵", "《民营经济促进法》5月20日正式实施", "#中美关税战特朗普为何突然服软#", "西安冰雹是人工增雨导致？假", "女子月收入4700元负债2544万", "重温中国女兵闪耀莫斯科红场", "巴基斯坦称已摧毁77架印度无人机", "5年前租的车突然被自动扣款1100", "俄防长乘车检阅 士兵高喊“乌拉”", "库里伤缺 勇士不敌森林狼", "巴基斯坦空军为何如此强悍", "普京与中国仪仗司礼大队政委握手", "何超莲回复窦骁生日祝福", "赵作海因病离世 此前蒙冤入狱11年", "父母花光积蓄将抑郁孩子送矫治机构", "印度称克什米尔遭袭击 巴方否认", "普京：赞扬英勇的中国人民", "巴方称与约80架印度战机交战", "巴基斯坦称摧毁印军一处重要指挥所", "马云回应回归阿里传闻", "俄罗斯市民眼中的胜利日阅兵", "武契奇：我答应过普京我会来", "西安突降冰雹 二手车商称多车被砸", "《亲爱的仇敌》上演女性暗战", "李承铉强撑困意为戚薇捏腿", "雄姿英发！中国仪仗队步入莫斯科红场", "何超莲晒生日合照不见窦骁", "这次大雨有一定致灾性", "3岁女童突发急性铊中毒 医生解读", "被解放军正步和白俄军乐团鼓点硬控", "普京阅兵式上高呼：节日快乐！乌拉", "四川两男子轮流托举救出坠河司机", "“传奇坦克”T-34驶过俄阅兵红场", "客服回应“婴儿高跟鞋”是装饰品", "郑钦文罗马赛红土首秀能否取胜", "高三学生咳嗽把左肺咳“消失”了", "荣昌高书记问开这么多药房干什么", "贾跃亭主动回应还债回国时间", "孙颖莎王楚钦封训混双训练画面", "盘点何超莲窦骁商业版图", "重庆主城区藏着处小众绝美风景", "英美谈判中美国没占到便宜", "解放军仪仗队红场唱响《游击队之歌》"]

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

// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.209
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
var default_search_words = ["总书记的人民情怀", "《731》预告片提醒：未满18岁谨慎观看", "被骗至缅甸高中生白天暴晒晚上挨打", "蜂群狼群！陆军首次披露无人作战模式", "年过九旬骑车去办公室的院士走了", "杨幂15年前的博文火了", "网警：共筑网安堤坝护航抗洪救灾", "两名中国人在柬埔寨遇害遭抛尸河中", "新郎去世 新娘终止妊娠被判返还彩礼", "以色列爆发全国性抗议", "哀牢山现“最大天牛” 紧邻冥界之花", "景区游客坠崖身亡：坐栏杆上不慎后仰", "生娃能领7笔钱 有人能拿10万", "巴西女子大巴上死亡 身上粘26部手机", "男大学生泳池跳水致高位截瘫", "闫妮悼念朱龙广 曾在武林外传演父女", "《731》定档 将于918上映", "刀郎演唱会简直就是大型KTV包厢", "被骗缅甸获救高考生收到录取通知书", "情侣游玩发生车祸死里逃生后领证", "浙江29年前的无名女尸案案情披露", "灵隐寺的辣椒 出家人不打诳语", "老师兼职送外卖10天挣了362.3元", "《西游记》如来佛祖扮演者朱龙广去世", "广东惠东县：白马山失联5人均已遇难", "直击苏超：盐城vs常州", "亡妻生前向男子转93万 法院判返还", "纽约时报：全球贸易史迎来黑暗一天", "六小龄童悼念朱龙广", "男子瞒着妻子花100多万疯狂网购", "直击苏超：连云港vs泰州", "坚持购买俄油 印度为何硬刚特朗普", "蔡奇看望慰问北戴河暑期休假专家", "21岁大专女孩成中国唯一女烘焙冠军", "“肉夹馍冰淇淋”走红", "哈登中国行学双截棍被震惊得愣住", "泰国民众集会要求佩通坦辞职", "直击苏超：宿迁vs无锡", "高考后学生挤爆整形科", "广东新增2892例基孔肯雅热本地病例", "华强北兴起小孩代送外卖 每单1-2元", "7000亿煤炭巨头要一口吃下13家公司", "台风“白鹿”已生成", "大神拒绝扎克伯格15亿美元天价offer", "脱口秀的夏天：捧红沂蒙山50岁房主任", "曝买华为原生鸿蒙手机要签知情书", "贾玲在粉丝胸肌上签名", "中国队爆冷无缘男子10米台奖牌", "被迫7.23亿卖身？知名央企严正声明", "陈雨菲2-0勇夺赛季第五冠", "莫迪回应被特朗普称为死亡经济体"]

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

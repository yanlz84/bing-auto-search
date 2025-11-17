// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.420
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
var default_search_words = ["《习近平法治文选》第一卷出版发行", "高市早苗被喊话向中国道歉", "王曼昱4-2击败孙颖莎 卫冕女单冠军", "十五运会为何没有奖牌榜", "世界最大、重要突破！中国捷报频传", "解放军出动轰炸机编队巡航 解读来了", "00后女孩中考失利后成世界冠军", "中国连发赴日提醒为何让日本担忧", "50块1斤的网红菜竟是云南人的绿化带", "央视曝光6666元包教包会养杀人蜂", "一年级校服970元贵吗", "官方辟谣居民成群结队挖到金子", "北京今冬供热季首个“升温令”发布", "高市早苗恐将日本拖入“国家危机”", "日本三个没想到", "日本欲改“无核三原则”意味着什么", "日高层：高市应该不会再有此类发言", "山村盗采地下水吸金 大户年入上百万", "王曼昱孙颖莎陈梦登上领奖台合影", "苏丹发生大屠杀 上千名平民遇害", "韩国政府宣布：中国排日本前面", "张桂梅看到杜富国 心疼地哭了", "被通缉“台独”网红叫嚣悬赏金太少", "“高市下台 高市去睡觉吧”", "12306：普速列车车厢连接处允许吸烟", "正直播NBA：勇士vs鹈鹕", "乒乓女单决赛上演最热血绝杀", "中国科学家破解困扰科学界近70年难题", "男子彩票中奖在群里分享 被邻居冒领", "三十年不尽赡养义务 男子丧失继承权", "警惕日本战略走向的危险转向", "南京一公园被私人占有十年", "48岁三甲医院主任医师岗位上病逝", "中国海警赴钓鱼岛领海巡航 专家解读", "日本GDP六个季度以来首次萎缩", "收废品大爷三种语言吆喝切换自如", "原来金字塔数量最多的国家不是埃及", "高市若继续铤而走险 日本将万劫不复", "固体杨枝甘露爆火 这些人群要少吃", "华强北内存条炒成“黑金条”", "孙颖莎给自己全运会单打表现打90分", "王曼昱全运卫冕复制张怡宁成就", "两代“慕容复”梦幻联动", "美军称随时待命对委内瑞拉采取行动", "警惕充电宝变“随身炸弹”", "乌士兵地窝子里喝茶时被俄军俘虏", "认养2年东北虎心衰死亡 林草局回应", "全运会这群“小海豚”出圈了", "没有葱高真不是一句笑话", "马斯克：数字“永生”有望20年内实现", "四川舰首次海试为何备受关注"]

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

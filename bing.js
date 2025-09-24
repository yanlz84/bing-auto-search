// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.312
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
var default_search_words = ["习近平接见新疆各族各界代表", "桦加沙风眼内部曝光 拍摄部门：震撼", "广东省委书记：决战就在眼前", "援疆的山海深情 跨越千里万里", "台风预计今天登陆广东 阵风可达17级", "网红罗几车祸遇难 肇事者自首", "今年最强台风桦加沙来袭", "广东多家餐厅租重卡停店门前", "最高级别警告 香港澳门挂十号风球", "台风致台湾发生洪灾 民众爬墙求救", "选班长投票超132万网友参与", "安徽3人为博取关注造谣被罚", "深圳机场飞机被“五花大绑”防台风", "盒马最难吃甜品被台风选出来了", "蔡磊妻子：蔡磊的近况“很不好了”", "为避台风 小区近百辆车停上大桥", "新能源车突然没电 司机硬推2公里", "台风来袭巨浪排山倒海 香港楼房晃动", "成都女孩在巴厘岛疑因食物中毒离世", "上海再通报多校午餐发臭：涉嫌瞒报", "台风“桦加沙”影响有多大？解读来了", "马克龙被美警察拦下 当场打给特朗普", "台湾花莲县暴雨洪水已致2死28伤", "特朗普警告孕妇别吃“泰诺”", "飞机狂风中降落 机翼险些砸地", "医院通报“CT报告单现不文明用语”", "大润发自营卫生巾惊现壁虎", "中国每年吃掉约70亿只白羽肉鸡", "女子术后20天发现体内留纱布已发臭", "25岁锡安暴瘦引热议", "中方代表：必须立即结束加沙惨剧", "教育部：五年新增63所职业本科学校", "美国洛杉矶上空现V形“UFO”", "王扁模仿王源走红疑开多号接受打赏", "珠海多区倡议沿海高层住宅居民撤离", "网友呼吁“崔丽丽案”改名", "美大豆收获季中国订购量仍为零", "星级酒店推10元自助早餐：有百种食物", "郑钦文：最后10%最难恢复", "美媒：中国航母能力实现重大飞跃", "航母女舰员英文喊话太提气", "扎波罗热核电站遭遇外部电源中断", "广东一地安排农民工住进学校避台风", "中方：美俄应进一步大幅削减核武库", "用一条毛巾避免大窗玻璃离家出走", "深圳开启全市最大应急避难场所", "美与盟友就承认巴勒斯坦国分歧加剧", "台风逼近香港 疑海水倒灌现3米喷泉", "以军在加沙城与哈马斯近距离交火", "哈里斯称后悔没阻止拜登再次参选", "景德镇鸡排哥回应走红"]

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

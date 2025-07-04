// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.148
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
var default_search_words = ["习近平的青春观", "15位数的电话号码即将启用", "俄海军副司令阵亡 驻地内可能有间谍", "7月7日起这场主题展览开幕 必看！", "日本一火山喷发 火山灰柱高达5000米", "兵马俑坑咋成“失物招领处”了", "国航一航班从北京起飞1小时后返航", "观众“烦”了的其实不是雷佳音", "特朗普与普京通话后抱怨：我很不满", "雨果因签证问题无缘美国大满贯", "《爱情公寓》羽墨扮演者自曝被骗", "壶口瀑布毛驴遭投诉动作不雅？假", "印度10年造出死亡折角立交桥", "美众议院表决通过“大而美”法案", "美承包商向加沙平民开火还冷血欢呼", "普京特朗普聊了1小时 讨论俄乌谈判", "韩军称控制1名越过分界线的朝鲜人员", "罗马仕深夜发文：没有倒闭", "被停职的佩通坦宣誓就任泰文化部长", "王祖贤清唱《倩女幽魂》梦回聂小倩", "马筱梅回应禁止大S子女去范玮琪家", "上海交大冲突事件引校门开放之争", "美股收盘：标普、纳指再创新高", "特朗普将签署“大而美”法案", "王毅就乌克兰危机阐述中方立场", "英伟达股价创新高 市值3.89万亿美元", "王嘉尔借出收入40%给朋友却遭背刺", "蛋仔派对就异常致歉 公布补偿方案", "女子熟睡被男友持刀架在脖子上", "雷佳音突然被观众“嫌弃”了", "歼-15T首次在航母甲板对公众开放", "黄河上再添一座新大桥", "美关税谈判“大限”将至 多方表态", "“他优雅地拉着生命的大提琴”", "山东舰编队为何在香港向公众开放", "山东舰航母抵达香港 停满舰载机", "洛阳一景区有游客被洪水冲走失联3天", "俄发射一枚“联盟-2.1a”运载火箭", "以军袭击致加沙42名平民死亡", "俄罗斯正式承认阿富汗临时政府", "樊振东8月31日有望迎来德甲首秀", "投资方：宇树科技或于科创板IPO", "利物浦前锋若塔因车祸离世", "王欣瑜止步温网女单第二轮", "5月汽车商品进出口250.6亿美元", "美媒：美伊拟下周在奥斯陆举行会谈", "德国高速列车袭击事件致4人受伤", "中概股脑再生科技暴涨超100%", "韩智库：韩国人口百年内或锐减85%", "颖儿分享割胆手术经历 医生提醒", "黄子韬见徐艺洋是用跑的"]

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

// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.452
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
var default_search_words = ["以文化赋能经济社会发展", "汶川地震被救女孩与施救军人结婚", "中俄就涉日本问题达成高度共识", "这个“500万”里有创新中国的未来", "男子拍到老君山“灵气护罩”奇观", "美军压境委内瑞拉总统大跳热舞", "全世界都在静静等待", "有医院一天测出66例甲乙流阳性", "充完电不拔充电器是在拿命“豪赌”", "求求你 别再用电动车“挡风被”了", "持续近5小时 俄美会晤谈及领土", "激素蛋大量流入市场系谣言", "妻子曝光丈夫生前出轨被捉奸视频", "美方紧急要求黎巴嫩归还炸弹", "流感超过48小时抗病毒药还管用吗", "台湾岛内掀反战浪潮", "12306回应取消靠窗选座", "俄美未达成“和平计划”折中方案", "生活中看到这种黄色小花立即上报", "一夜之间所有的缅因猫都在被盘问", "日本军事准备曝光：研发“万能血浆”", "华裔女子痔疮手术后不堪剧痛自杀", "老人腹泻离世儿子睡其床后确诊同症", "安徽一地召开全县“吐槽大会”", "日本决定上调出境税 为现行三倍", "百元翻新羽绒服是真香还是真坑", "28岁妈妈带3岁女儿失联1个月", "男子通过外卖找到妻子打赏的男主播", "iPad中国市场份额大跌", "员工1个月14次如厕超1小时被解雇", "消防领域重拳反腐 7名总队长被查", "酒后使用“智驾”当代驾能免责吗", "“台湾一旦沦为战场什么都是空谈”", "军嫂迎接退役的一级军士长", "云南大理州公安局局长等7人同日被查", "冷冷冷！“极冷”冷涡系统形成", "日本北海道熊尸体多到装不下", "警惕境外组织利用恶意SDK收集信息", "减重抵物业费 小区126人共减1050斤", "香港警方就大埔火灾拘捕15人", "内塔尼亚胡请求特赦遭强烈抗议", "中俄举行战略安全磋商", "白宫承认防长下令二次打击运毒船", "中国科学家破解水稻高温感知机制", "《疯狂动物城2》总票房破21亿", "5台电脑采购价近3亿？系单位标注错误", "直击以军突袭巴勒斯坦", "王毅与绍伊古会面 两人微笑握手", "乌总统：俄乌和平协议无简单解决方案", "中国买大豆毁掉巴西雨林？假的！", "委内瑞拉恢复美方遣返移民航班"]

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

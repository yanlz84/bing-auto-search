// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.258
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
var default_search_words = ["看上合发展壮大的“行动密码”", "中国抗战阅兵以来日本砸560亿搞公关", "上海一小学今年仅招到22人", "这是你没见过的阅兵训练画面", "全国“秋老虎”出没地图来了", "俄方：普京将展开对华世纪之行", "男子三亚游泳溺水 妻子崩溃大哭", "女孩上班不挣钱反欠公司13800元", "别被“睡够8小时”绑架了", "莫迪4次拒接特朗普电话", "军报批日本呼吁各国不参加九三阅兵", "山东一幼儿园用胶带封孩子嘴？假", "丈夫两次冲进火场救妻双双烧伤", "郑佩佩儿子为妻子再次众筹医药费", "郭德纲回应与郭麒麟父子关系争议", "樊振东祝福霉霉订婚", "美团：二季度净利润下降89%", "大润发回应网友因环保袋泪崩", "黑猩猩暴打鸭子“同事”被同伴劝架", "大妈弄翻20万摩托赔1千后拉黑车主", "深圳一小区被曝有隐藏豪华建筑", "媒体评欢乐谷女团表演被指擦边", "电子产品“防蓝光”功能真能护眼吗", "戴安娜王妃的时间胶囊被提前挖出", "美股收盘：三大指数齐涨 标普创新高", "大三学生称暑期被诈骗200万", "俄再度公布涉日本军国主义解密档案", "15岁初中女生离家出走6天无音讯", "精神障碍父亲失踪9年后突然被找到", "演员段伟伦去世 曾出演警察故事系列", "15岁女孩一只耳朵一次打了14个耳洞", "毒犯整容逃亡 因耳朵露馅被捕", "20多家蛋糕店被同一人牟利性举报", "陌生女子当街锤击小孩已被警方带走", "阿根廷总统遭抗议者扔石块", "当地回应“老农保”29年后仅退200元", "缺觉可能会让你加速变胖", "年轻教师因开学产生焦虑", "防空导弹专家于本水院士逝世", "特朗普“关税大棒”棒打鸳鸯却翻车", "英伟达营收未达预期 盘后一度大跌", "女子上班7天反欠公司1万多", "中国女排世锦赛小组第一", "退休教师称与发妻八字不合起诉离婚", "湖北面积最小县 旅游收入翻了一倍多", "霉霉称男友像气氛助推器 照亮生活", "湖北一河流被曝成黑水河散发药味", "女子称银行失误致其有征信污点", "特朗普要对索罗斯下手了", "广西梧州市市长李振品被查", "樊振东回应为何选择萨尔布吕肯"]

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

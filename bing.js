// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.189
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
var default_search_words = ["习近平会见科斯塔、冯德莱恩", "6名大学生溺亡事故最新调查：3人被抓", "俄罗斯失事客机上有1名中国公民", "闰六月来了 本世纪有6次", "泰国称再次空袭柬埔寨 现场照片公布", "尹锡悦为了吹空调 频繁让律师探监", "内蒙古提级调查6名大学生溺亡事件", "蔡依林：已冻卵 暂无生小孩计划", "网警护航 | 录取季警惕通知书陷阱", "中南大学通报谭某兵被举报嫖娼事件", "6名大学生溺亡 矿物加工同学发声", "基孔肯雅热出现人传人？假", "比亚迪天府机场失控转圈", "广东省长：尽快扑灭基孔肯雅热疫情", "阚清子宣布怀孕", "中国篮协：杨瀚森将不出战亚洲杯", "泡泡玛特王宁：我们缝纫机都踩冒烟了", "比亚迪疑失控绕圈行驶 多方回应", "目击者拍到俄客机坠毁前飞行画面", "矿物专业学长分析6名大学生溺亡事故", "起底6名大学生遇难矿业公司", "检出致癌物的卫生巾8年卖了33.3亿", "俄客机坠毁49人无人生还", "亚洲地区“百名红通人员”清零", "媒体五问6名大学生参观学习溺亡事件", "泰国代理总理：尚未进入战争状态", "中方回应泰柬边境冲突：深感担忧", "知情人：掉入浮选槽会骨折 无法呼吸", "律师解读6名学生参观学习意外溺亡", "骨科主任10年受贿1338万元被诉", "杨瀚森发文致谢篮协和国家队", "佩通坦含泪谴责柬埔寨向平民区开火", "学生遇难企业曾是优秀实践教育基地", "佩通坦发声泰国军队已做好充分准备", "樊振东王楚钦击掌问候", "误报石破茂决定辞职的报纸被拍卖", "阚清子现任丈夫为圈外人士", "泰柬边境交火第一枪究竟谁开的", "当事人回应暴雨中打伞吃饭", "泰媒：泰军战机炸毁柬军两处指挥部", "上海提高退休人员养老金", "泰柬边境交火升级", "泰柬边境冲突背后的根源是什么", "今年第9号台风“罗莎”生成", "专家谈泰柬边境局势后续将如何发展", "明道称被朱孝天删好友", "被“蝉尿”滋一身有毒吗？专家回应", "飞儿乐队前主唱詹雯婷与陈建宁和解", "医生回应怀孕32周感染基孔肯雅热", "男子雨天穿洞洞鞋蹚水感染丹毒", "参观矿企遇难实习生家属发声"]

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

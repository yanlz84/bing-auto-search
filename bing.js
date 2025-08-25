// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.253
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
var default_search_words = ["习近平强调抓好“四件大事”", "月嫂疏忽致29天婴儿重摔颅内出血", "舅舅连续5年暑假接待16个外甥", "三声“不容易” 道尽爱国情", "年轻人组队勇闯公园相亲角", "中方回应越南在南沙群岛填海造陆", "护网：警惕零日漏洞“定时炸弹”", "男子看小说学盗墓挖走20余件国宝", "6岁娃光脚踩到死鱼进了ICU", "小吃店买400粒复方甘草片做卤料", "近40℃高温的杭州突降冰雹", "女子称被割掉正常器官 医院辟谣", "中铁沈阳局推火车自助 35元随便吃", "初中女生饿瘦到70斤：因身材焦虑", "中国农行原副行长楼文龙被判无期", "早睡一小时比跑步30分钟更减肥", "女子紧身裤暗藏160支减肥针被查", "上海：符合条件家庭外环外买房不限购", "酷派称将陆续上架嘎子哥所售手机", "唐嫣晒照连续11年为刘亦菲庆生", "上海遭遇强对流局地半小时降温13℃", "宣传控烟不必“绑架”鲁迅先生", "台风“剑鱼”吹袭三亚后现状", "网红良子体重350多斤 胃袋占150多斤", "董事长前妻“炮轰”公司新董秘", "郎朗活动海报被指抄袭：已下架", "42岁抗癌博主“杨美美”去世", "莫雷加德球拍被踩", "#直击三亚十二级台风天气#", "魏大勋父亲公司被执行233万", "女孩读烈士家书感动外国游客", "故意调低温度卖毛毯？春秋航空回应", "多国停邮美国 最头疼的是谁", "4次断骨打开折叠男孩迈出新生第一步", "608名民辅警集体减重近3千斤", "#鲁迅抽烟墙画被要求撤下合理吗#", "三亚游客遇台风 海景房变“风扇房”", "孙颖莎瑞典大满贯赛后发文", "孙颖莎女单冠军自拍太可爱", "上海迪士尼将增加更多中间票价等级", "中方否认参与在乌克兰维和部队", "莫雷加德：男单夺冠意义重大", "张靓颖自曝体检查出营养不良", "泽连斯基：这件事很久不和美国商量了", "印度外长：中印关系发展与美国无关", "成品油价格或迎年内第七跌", "袁昊否认与赵昭仪恋情", "女子海边心脏骤停 女医生跪地救回", "乌克兰公开远程“海王星”导弹图像", "阅兵装备方队唯一的“女教头”是她", "加沙已无法支撑任何新一轮民众撤离"]

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

// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.438
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
var default_search_words = ["习近平会见汤加国王图普六世", "日本三套“夺岛方案”曝光 专家解读", "高市越位 美国越顶", "神舟二十二号与空间站完成对接", "婚前同居认定属于家庭成员", "蔡磊称自己只剩3到5年生命", "特朗普催拍成龙主演电影《尖峰时刻》", "妈妈生二胎期间5岁儿子在家发烧离世", "环保少女和同伴将威尼斯大运河染绿", "日本升级武器 图谋极具危险性", "特朗普：俄乌和平协议非常接近达成", "无人快递车“吵架”系谣言", "《狂野时代》部分场超30%观众提前离场", "特朗普电话后 日本沮丧了三次", "六旬老人做14个单杠大回环突发心梗", "美股收盘：谷歌市值逼近4万亿美元", "男装店用烟灰缸做吊牌后退货减少", "京东首车遭退定", "美国知名空头“死咬”英伟达", "女子掉入5米深冰河多亏穿了厚羽绒服", "充电宝3C认证将全面失效", "高市早苗错误言论恶化中日交流氛围", "树坚强与树小强1个月内两次见证发射", "日首相官邸前再次响起“高市下台”", "越南出现“抢房潮” 有人大打出手", "小心！你收藏的邮票可能是“软刀子”", "中国驻日本福冈总领馆紧急提醒", "南海舰队：中国军人只有战死没有吓死", "乒乓球比赛运动员为什么要摸球台", "在日中国游客提前回国 机场仿佛春运", "河南8岁失联女孩遗体在化粪池找到", "“高市早苗的言行是亵渎历史正义”", "演员仝卓表弟在柬埔寨失联", "特朗普在白宫赦免火鸡 引全场爆笑", "3岁女童脸部贴贴纸致皮肤糜烂", "中国海军989编队前往马来西亚", "华为Mate 80业界首发无网应急通信", "新华社再评高市早苗", "都江堰水库被放生埃及塘鲺？当地澄清", "陈佩琪代表柯家人向黄国昌致谢", "最高检：精神暴力也是家暴", "日方“愿意对话”的姿态很伪善", "美国家公园“美国优先”：对外国涨价", "学生给妈妈挣医药费在黑板留言求瓶子", "乌克兰已原则同意美提出的和平协议", "大风+台风+沙尘暴！多预警齐发", "联合国正式启动下任秘书长遴选程序", "员工入职要改成鼠姓？三只松鼠回应", "专家称神舟二十号可安全载货返回", "日本民众再集会要求高市撤回发言", "美媒：美军最高将领赴加勒比视察"]

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

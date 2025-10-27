// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.378
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
var default_search_words = ["抓住时间窗口 赢得战略主动", "2架美军机在南海相继坠毁", "有一种冷叫老师觉得你冷", "从“十五五”全球热词看中国新机遇", "按摩店初中文凭小伙娶美国女博士", "一碗龟苓膏要消耗几只乌龟", "纪欣：希望看到国家统一", "不当使用“万能遥控器”或涉嫌违法", "给美军捐1.3亿美元的神秘人身份曝光", "多名“考古学家”白天考古晚上盗墓", "建议冬天床单两周换洗一次", "网民用AI编造3儿子不养老人被罚", "毛宁向世界分享中国“人造太阳”", "俄罗斯成功试射海燕核动力巡航导弹", "阿里前CEO张勇购入香港半山豪宅", "多所高校正在培养带娃专家", "“药中茅台”片仔癀价格大跌", "男子浅水区跳水身亡 游泳馆回应", "普通米粉卖给术后老人宣称替代吃饭", "普京：核动力巡航导弹全世界独一无二", "男子持续两三年朝商店扔钱拒绝拿回", "最低3元1碗 年轻人抢着去博物馆炫饭", "台湾创投公司CEO与女子陈尸豪宅", "35元1个面包被年轻人疯抢", "顾客买药电话接不通 骑手返店查药效", "特朗普2.0亚洲“首秀”：五天三国", "加拿大一则广告为何成特朗普心中痛", "澳门女大学生被骗800万港元", "大湾区6000吨“巨龙”现毫米级合体", "俄方已向美通报核动力导弹试射情况", "男子下河电鱼致人触电身亡 获刑一年", "正式加入东盟 东帝汶总理流泪了", "顶级大佬齐呼吁：暂停超级智能研发", "郑丽文喊话朱赵二人一起收拾民进党", "为什么降温了肠胃不舒服", "周玉琴：我是中国人我骄傲", "公园捡的“红豆”千万不要吃", "2026年国考报名人数创新高", "美媒爆料：印度仿制中国霹雳-15导弹", "街头掉落的银杏果别随便吃", "哈马斯：将移交加沙地带行政控制权", "网球爱好者为省钱像候鸟一样迁徙", "东部战区空军部队赴台岛周边训练", "比特币升破112000美元", "糖炒栗子加糖真不是为了甜", "四川甘孜发生4.7级地震", "新加坡总理：中国是已经崛起的强国", "18岁少年鳌太线失联超10天", "台网红“馆长”被送当归咖啡", "长白山天池出现沸腾开锅？景区回应", "成都一景区古柳突倾倒 两游客被砸伤"]

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
